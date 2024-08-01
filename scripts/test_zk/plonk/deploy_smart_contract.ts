import { deploy }from './web3-lib'
import Web3 from 'web3'
import { Contract, ContractSendMethod, Options } from 'web3-eth-contract'

(async () => {
  try {
    const web3 = new Web3(web3Provider)

    const result = await deploy('Verifier', ['0xb27A31f1b0AF2946B7F582768f03239b1eC07c2c'])
    console.log(`address: ${result.address}`)

    const resultIV = await deploy('IdentityVerification', [result.address])
    console.log(`address: ${resultIV.address}`)

    const artifactsContractVerifierPath = `browser/contracts/zkp/artifacts/verifier.json`
    const artifactsContractIdentityVerificationPath = `browser/contracts/zkp/artifacts/IdentityVerification.json`

    const metadataV = JSON.parse(await remix.call('fileManager', 'getFile', artifactsContractVerifierPath))
    const metadataIV = JSON.parse(await remix.call('fileManager', 'getFile', artifactsContractIdentityVerificationPath))

    const accounts = await web3.eth.getAccounts()
    const defaultAccount = accounts[0];

    const contractVerifier: Contract  = new web3.eth.Contract(metadataV.abi)
    const contractIdentity: Contract  = new web3.eth.Contract(metadataIV.abi)
   
   const proof = [["0x12fbc4b3f7b5a647e7a9af8a255d4ffd548c9a24f4ce0a7c8c7ab181d556cf2f","0x205cd78eb49ac65c61aa95bd6b49760eee0d8b8471d3f3eeb1f5a9fb9c65143a"],[["0x1b3b24c7cf499dcbb90e0385041a05747a1a28fb3e76f2bd1c1a3c402cb4ca68","0x2c830a2a1e8761dd4c583c6770184b176770226adfbd835231d223084a480509"],["0x084246a302c1d3a3ddea22018bd329d44c2056d03820372340e0f0a6218731c3","0x281e8f2f155fd3a8b9f0d1f2fedc18582dbf178ed1912c689f5872cf67556026"]],["0x25a8d725349c0824e78cf345ca40b1cfd2b5aa9fce3838aac68074b167d50404","0x0b72f1cb19d7519b45ac33f9724ec4b1b8fdc14588eb90900aa4fd0a130bca2b"]]
    
    // Medir el tamaño de la prueba
    const proofSize = web3.utils.hexToBytes(proof).length;
    console.log(`Size of the proof in bytes: ${proofSize}`);

    


    // Estimar el gas requerido para la verificación
    const gasEstimate = await contractIdentity.methods.verifyIdentity(proof).estimateGas({ from: defaultAccount });
    console.log(`Estimated gas for verification: ${gasEstimate}`);

    // Medir el tiempo de verificación
    const startTime = Date.now();
    const tx = await contractIdentity.methods.verifyIdentity(proof).send({ from: defaultAccount, gas: gasEstimate });
    const endTime = Date.now();

    console.log(`Gas used for verification: ${tx.gasUsed}`);
    console.log(`Time taken for verification: ${endTime - startTime} ms`);
  } catch (e) {
    console.log(e.message)
  }
})()

