(async () => {
  const gasLimit = 10000000; // Ajustar según sea necesario
  try {
    const web3 = new Web3(web3Provider);
    let result;
    let resultIV;

    // Medir tiempo de despliegue para PlonkVerifier
    console.time('Deploy PlonkVerifier');
    try {
      console.log('Deploying PlonkVerifier...');
      result = await deploy('PlonkVerifier', []);
      console.log('Verifier deployed');
      console.log(`Verifier contract address: ${result.address}`);
    } catch (error) {
      console.error('Error deploying Verifier:', error);
      return;
    }
    console.timeEnd('Deploy PlonkVerifier');

    // Medir tiempo de despliegue para VerificationPlonk
    console.time('Deploy VerificationPlonk');
    try {
      console.log('Deploying VerificationPlonk...');
      resultIV = await deploy('VerificationPlonk', [result.address]);
      console.log('VerificationPlonk deployed');
      console.log(`VerificationPlonk contract address: ${resultIV.address}`);
    } catch (error) {
      console.error('Error deploying VerificationPlonk:', error);
      return;
    }
    console.timeEnd('Deploy VerificationPlonk');

    // Medir gas consumido
    const receiptVerifier = await web3.eth.getTransactionReceipt(result.transactionHash);
    if (!receiptVerifier) {
      console.error('Failed to get transaction receipt for Verifier');
      return;
    }
    const receiptVerificationPlonk = await web3.eth.getTransactionReceipt(resultIV.transactionHash);
    if (!receiptVerificationPlonk) {
      console.error('Failed to get transaction receipt for VerificationPlonk');
      return;
    }

    console.log(`Gas used for Verifier: ${receiptVerifier.gasUsed}`);
    console.log(`Gas used for VerificationPlonk: ${receiptVerificationPlonk.gasUsed}`);

    // Leer prueba y señales públicas desde input.json
    const proofDataPath = `browser/zk/build/plonk/input.json`;
    const proofData = JSON.parse(fs.readFileSync(proofDataPath, 'utf8'));
    const proofDataSize = Buffer.byteLength(JSON.stringify(proofData), 'utf8');
    console.log(`Proof data size: ${proofDataSize} bytes`);

    // Continuar con la lógica de despliegue, interacción con los contratos, etc.

  } catch (error) {
    console.error('Error in deployment process:', error);
  }
})();