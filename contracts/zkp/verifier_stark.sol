// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EllipticCurve.sol";

contract OffChainVerification {
    struct User {
        string name;
        string email;
        string country;
    }

    mapping(address => User) public users;
    mapping(address => bool) public isVerified;

    bytes32 public expectedProofHash;
    bytes32 public publicKeyHash;

    event DebugMessage(string message);
    event DebugValue(string message, uint256 value);
    event DebugString(string message);
    event DebugUint(string message, uint256 value);

    uint256 public constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 public constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 public constant AA = 0;
    uint256 public constant BB = 7;
    uint256 public constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint public constant N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

    constructor(bytes32 _expectedProofHash, bytes32 _publicKeyHash) {
        expectedProofHash = _expectedProofHash;
        publicKeyHash = _publicKeyHash;
    }

    function verifySignature(bytes32 calculatedProofHash, bytes memory signature, bytes32 _publicKeyHash) public returns (bool) {
        emit DebugMessage("Starting verifySignature");

        require(calculatedProofHash == expectedProofHash, "Proof hash does not match");
        emit DebugMessage("Proof hash matched");

        bytes32 ethSignedMessageHash = toEthereumSignedMessageHash(calculatedProofHash);

        require(_publicKeyHash == publicKeyHash, "Invalid public key hash");
        emit DebugMessage("Public key hash matched");

        bool isValid = verify(ethSignedMessageHash, signature, _publicKeyHash);
        emit DebugMessage("Verify function called");

        require(isValid, "Invalid signature");
        emit DebugMessage("Signature is valid");

        return true;
    }


    function toEthereumSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function verify(
        bytes32 hash,
        bytes memory signature,
        bytes32 publicKeyHash
    ) internal returns (bool) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        uint256 sInv = EllipticCurve.invMod(uint256(s), N);
        uint256 u1 = mulmod(uint256(hash), sInv, N);
        uint256 u2 = mulmod(uint256(r), sInv, N);

        // Simplifica la verificación y realiza pruebas paso a paso
        return (u1 != 0 && u2 != 0);  // Un ejemplo simplificado
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
