//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

interface IVerifier {
    function verifyProof(bytes memory proof, uint[] memory pubSignals) external view returns (bool);
}



contract zkp_proof_sql_contract{
    /*mapping(address=>zkp) public proofs ;



    function registerProof(address verifiable , string memory tableName , sqlOperation op ,  bytes32[] memory values ,bytes32[] memory conditions
    )public returns (uint) {*/

    enum sql_operation{Select, Insert, Delete , Update}
    event RequestPosted(address issuer, uint256 commitment);
    event TableCreated(string table, uint256 commitment);
    event TableUpdated(string table, uint256 commitment);

    address public insert_verifier;
    address public select_verifier;
    address public delete_verifier;
    address public update_verifier;
    uint256 proofTimeStamp;
    mapping (string=> uint256) table_commitments;
    //mapping <string ,uint> rowsCommitted  ,  mapping <string ,uint> columnsCommitted ;
    mapping (uint256=> string) requests_commitments;

    constructor(address insert_verifier_, address update_verifier_, address select_verifier_, address delete_verifier_) {
        assert(insert_verifier_.code.length == 0);
        assert(update_verifier_.code.length ==0);
        assert(select_verifier_.code.length ==0);
        assert(delete_verifier_.code.length==0);
        insert_verifier = insert_verifier_;
        update_verifier = update_verifier_;
        select_verifier = select_verifier_;
        delete_verifier = delete_verifier_;
    }


    function createTable(string memory tableName , uint commitment)public{
        require(table_commitments[tableName] == 0, "La tabla ya existe");
        table_commitments[tableName] = commitment ;
        emit TableCreated(tableName, commitment);
    }

    function request(string memory table, uint256 argsCommitment) public {
        requests_commitments[argsCommitment] = table;
        emit RequestPosted(msg.sender, argsCommitment);
    }

    function execRequest(sql_operation opcode, uint256 argsCommitment, uint newCommitment, bytes memory proof) public returns (bool){
        address verifier = verifierForOperation(opcode);
        string memory table = requests_commitments[argsCommitment];
        require(bytes(table).length != 0, "Request unknown");

        uint256[] memory publicInputs = new uint256[](3);
        publicInputs[0] = newCommitment;
        publicInputs[1] = table_commitments[table];
        publicInputs[2] = argsCommitment;
        require(IVerifier(verifier).verifyProof(proof, publicInputs), "SNARK verification failed");

        table_commitments[table] = newCommitment;
        emit TableUpdated(table, newCommitment);   
        return true;     
    }

    function verifierForOperation(sql_operation opcode) internal view returns (address){
        if (opcode == sql_operation.Select){
            return select_verifier;
        } else if (opcode == sql_operation.Insert){
            return insert_verifier;
        } else if (opcode == sql_operation.Delete){
            return delete_verifier;
        } else if (opcode == sql_operation.Update){
            return update_verifier;
        } else {
            revert("Operation not valid");
        }
}
    
}