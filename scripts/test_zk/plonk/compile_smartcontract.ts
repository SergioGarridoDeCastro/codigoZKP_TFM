const ethers = require('ethers');
const readline = require('readline');

(async () => {
  try {
    const contractPath = 'zk/build/plonk/zk_verifier.sol';
    
    // Compilar el contrato en Remix
    await remix.call('solidity', 'compile', contractPath);
    console.log("Compilacion correcta");

    // Compilar el contrato en Remix
    await remix.call('solidity', 'compile', 'contracts/zkp/verifier_plonk.sol');
    console.log("Compilacion correcta");
    
    // Obtener los metadatos del contrato
    const compilationResult = await remix.call('solidity', 'getCompilationResult');
    const contractName = "PlonkVerifier"; // Asegúrate de usar el nombre correcto del contrato
    //console.log("Resultado Compilacion", compilationResult);


    
  } catch (error) {
    console.error('Error en la compilacion:', error);
  }
})();
