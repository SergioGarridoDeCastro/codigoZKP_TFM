// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "/zk/build/plonk/zk_verifier.sol"; // Asegúrate de que el contrato Verifier está en el mismo directorio

contract VerificationPlonk {
    struct User {
        string name;
        string email;
        string country;
    }

    mapping(address => User) public users;
    mapping(address => bool) public isVerified;

    PlonkVerifier plVerifier;

    event ProofVerificationAttempt(address indexed user, bool success);

    constructor(address verifierAddress) {
        plVerifier = PlonkVerifier(verifierAddress);
    }

    function verifyIdentity(
        uint256[24] calldata proof, uint256[1] calldata pubSignals
    ) public{
        require(!isVerified[msg.sender], "Already verified");

        // Verificar la prueba zk-SNARK utilizando los parámetros proporcionados
        bool proofValid = verifyProof(proof, pubSignals);
        emit ProofVerificationAttempt(msg.sender, proofValid); // Log the result of proof verification

        require(proofValid, "Invalid proof");

        // Marcar la dirección del remitente como verificada
        isVerified[msg.sender] = true;
    }

    // Función para verificar la prueba zk-SNARK
    function verifyProof(
        uint256[24] calldata proof, uint256[1] calldata pubSignals
    ) internal view returns (bool) {
        // Crear una instancia del Verifier y obtener la prueba

        return plVerifier.verifyProof(proof, pubSignals);
    }

   
}

