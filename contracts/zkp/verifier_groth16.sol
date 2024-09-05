// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "/verifier.sol"; // Asegúrate de que el contrato Verifier está en el mismo directorio

contract VerificationGroth16 {
    using Pairing for *;
    struct User {
        string name;
        string email;
        string country;
    }

    mapping(address => User) public users;
    mapping(address => bool) public isVerified;

    Verifier verifier;

    constructor(address verifierAddress) {
        verifier = Verifier(verifierAddress);
    }

    function verifyIdentity(
        Verifier.Proof memory proof
    ) public {
        require(!isVerified[msg.sender], "Address already verified");

        // Verificar la prueba zk-SNARK utilizando los parámetros proporcionados
        bool proofIsValid = verifyProof(proof);
        require(proofIsValid, "The provided proof is invalid");

        // Marcar la dirección del remitente como verificada
        isVerified[msg.sender] = true;
    }

    // Función para verificar la prueba zk-SNARK
    function verifyProof(
        Verifier.Proof memory proof
    ) internal view returns (bool) {
        // Crear una instancia del Verifier y obtener la prueba

        return verifier.verifyTx(proof);
    }

   
}

