// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/interface_verifier_stark.sol"; 

contract IdentityVerification {
    struct User {
        string name;
        string email;
        string country;
    }

    mapping(address => User) public users;
    mapping(address => bool) public isVerified;

    StarkVerifier starkVerifier;

    constructor(address verifierAddress) {
        starkVerifier = StarkVerifier(verifierAddress);
    }

    function verifyIdentity(
        uint256[24] calldata proof, uint256[1] calldata pubSignals
    ) public {
        require(!isVerified[msg.sender], "Already verified");

        // Verificar la prueba zk-SNARK utilizando los parámetros proporcionados
        require(verifyProof(proof, pubSignals), "Invalid proof");

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