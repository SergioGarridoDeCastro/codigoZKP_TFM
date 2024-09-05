(async () => {
  try {
    console.log('Requesting MetaMask connection...');

    // Solicitar la conexión a MetaMask
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
    } else {
      console.error('MetaMask not detected!');
      return;
    }

    const accounts = await web3.eth.getAccounts();
    console.log('Connected account:', accounts[0]);

    console.log('Deploying contracts...');

    const metadata_verifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/Verifier.json'));
    const metadata_groth16Verifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/contracts/zkp/artifacts/VerificationGroth16.json'));
    const proofData = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/proof.json'));

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
    console.log('Verifier Contract Deployment Time (ms):', (endDeployVerifier - startDeployVerifier).toFixed(3));

    // Deploy Groth16Verifier contract
    let contract_groth = new web3.eth.Contract(metadata_groth16Verifier.abi);

    const grothDeploy = contract_groth.deploy({
      data: metadata_groth16Verifier.data.bytecode.object,
      arguments: [verifierReceipt.options.address]
    });

    const startDeployGroth = performance.now();
    const grothReceipt = await grothDeploy.send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endDeployGroth = performance.now();

    console.log('Groth16Verifier Contract Address:', grothReceipt.options.address);
    console.log('Groth16Verifier Contract Deployment Time (ms):', (endDeployGroth - startDeployGroth).toFixed(3));

    // Prepare input data for verifyIdentity
    const proof = proofData.proof;
    const inputs = proofData.inputs;  // Assuming inputs are required

    const startTx = performance.now();
    const verifyReceipt = await grothReceipt.methods.verifyIdentity(
      proof
    ).send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endTx = performance.now();

    console.log('verifyIdentity Transaction Gas Used:', verifyReceipt.gasUsed);
    console.log('verifyIdentity Transaction Time (ms):', (endTx - startTx).toFixed(3));

  } catch (e) {
    console.log('Error:', e.message);
  }
})();
