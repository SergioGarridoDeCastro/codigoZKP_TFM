# Proyecto ZKP para TFM
Este proyecto contiene contratos inteligentes, circuitos aritméticos y scripts diseñados para verificar pruebas de conocimiento cero (ZKPs) generadas por ZoKrates y Circom utilizando zk-SNARKs.
 
Estructura del Proyecto
- contracts/: Contratos inteligentes en Solidity para verificar ZKPs.
- scripts/: Scripts en TypeScript para desplegar y gestionar contratos.
- circuits/: Circuitos aritméticos creados con Circom.
- zokrates/: Pruebas generadas mediante ZoKrates.
- tests/: Pruebas automatizadas.

Requisitos
- Node.js
- Hardhat
- ZoKrates
- Circom
- Solidity

Generación de Pruebas
- Para generar pruebas con ZoKrates:
    zokrates compile -i <circuit.zok>
    zokrates setup
    zokrates compute-witness -a <inputs>
    zokrates generate-proof

- Para generar pruebas con Circom:
    circom <circuit.circom> --r1cs --wasm --sym
    snarkjs groth16 setup <circuit.r1cs> <ptau_file> <circuit_final.zkey>
    snarkjs groth16 prove <circuit_final.zkey> <witness.wtns>

Contribuir
1. Haz un fork del repositorio.
2. Crea una nueva rama (git checkout -b feature-branch).
3. Realiza un commit de tus cambios (git commit -m 'Añadir nueva funcionalidad').
4. Abre un pull request.

Licencia
Este proyecto está licenciado bajo la Licencia MIT.

