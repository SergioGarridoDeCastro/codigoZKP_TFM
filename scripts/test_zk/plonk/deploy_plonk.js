(async () => {
  try {
    console.log('Deploying contracts...');

    const metadata_verifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/zk/build/plonk/artifacts/PlonkVerifier.json'));
    const metadata_plonkVerifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/contracts/artifacts/VerificationPlonk.json'));
    const proofData = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/zk/build/plonk/input.json'));
    console.log('Loaded proofData:', proofData);

   const accounts = await web3.eth.getAccounts()

    // Deploy Verifier contract
    let contract_verifier = new web3.eth.Contract(metadata_verifier.abi);

    contract_verifier = contract_verifier.deploy({
      data: metadata_verifier.data.bytecode.object,
      arguments: []
    });

    const startDeployVerifier = performance.now();
    const verifierReceipt = await contract_verifier.send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endDeployVerifier = performance.now();

    console.log('Verifier Contract Address:', verifierReceipt.options.address);
    //console.log('Verifier Contract Deployment Gas Used:', verifierReceipt.gasUsed);
    console.log('Verifier Contract Deployment Time (ms):', endDeployVerifier - startDeployVerifier);

    // Deploy plonkVerifier contract
    let contract_plonk = new web3.eth.Contract(metadata_plonkVerifier.abi);

    contract_plonk = await contract_plonk.deploy({
      data: metadata_plonkVerifier.data.bytecode.object,
      arguments: [verifierReceipt.options.address]
    });

    const startDeployplonk = performance.now();
    const plonkReceipt = await contract_plonk.send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endDeployplonk = performance.now();

    console.log('plonkVerifier Contract Address:', plonkReceipt.options.address);
    //console.log('plonkVerifier Contract Deployment Gas Used:', plonkReceipt.gasUsed);
    console.log('plonkVerifier Contract Deployment Time (ms):', endDeployplonk - startDeployplonk);

    // Prepare input data for verifyIdentity
    const proof = proofData._proof;  // Accede al array completo directamente
    const inputs = proofData._pubSignals;  // Accede al array de señales públicas

    const startTx = performance.now();
    const verifyReceipt = await plonkReceipt.methods.verifyIdentity(
      proof,
      inputs
    ).send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endTx = performance.now();

    console.log('verifyIdentity Transaction Gas Used:', verifyReceipt.gasUsed);
    console.log('verifyIdentity Transaction Time (ms):', endTx - startTx);

  } catch (e) {
    console.log(e.message);
  }
})();
