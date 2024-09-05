(async () => {
  try {
    console.log('deploy...')

    const metadata_verifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/Verifier.json'))
    const metadata_groth16Verifier = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/contracts/zkp/artifacts/VerificationGroth16.json'))
    const proofData = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/proof.json'));
    
    const accounts = await web3.eth.getAccounts()

    let contract_verifier = new web3.eth.Contract(metadata_verifier.abi)

    const startDeployVerifier = Date.now();
    contract_verifier = contract_verifier.deploy({
      data: metadata_verifier.data.bytecode.object,
      arguments: []
    })
    const endDeployVerifier = Date.now();

    console.log(newContractVerifierInstance.options.address)
    //console.log('Verifier Contract Deployment Gas Used:', newContractVerifierInstance.options.gas);
    console.log('Verifier Contract Deployment Time (ms):', endDeployVerifier - startDeployVerifier);

    newContractVerifierInstance = await contract_verifier.send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    })
    

    let contract_groth = new web3.eth.Contract(metadata_groth16Verifier.abi)

    contract_groth = await contract_groth.deploy({
      data: metadata_groth16Verifier.data.bytecode.object,
      arguments: [newContractVerifierInstance.options.address]
    })

    newContractGrothInstance = await contract_groth.send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    })
    console.log(newContractGrothInstance.options.address)


    // Execute verifyIdentity transaction
    // Prepare input data for verifyIdentity
    const proof = proofData.proof;
    const inputs = proofData.inputs;  // Assuming inputs are required

    const startTx = Date.now();
    const receipt = await newContractGrothInstance.methods.verifyIdentity(
      proof
    ).send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000'
    });
    const endTx = Date.now();

    console.log('verifyIdentity Transaction Gas Used:', receipt.gasUsed);
    console.log('verifyIdentity Transaction Time (ms):', endTx - startTx);
  } catch (e) {
    console.log(e.message)
  }
})()