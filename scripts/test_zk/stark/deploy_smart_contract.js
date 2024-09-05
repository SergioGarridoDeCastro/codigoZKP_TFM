// Cargar Web3 desde un CDN
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.3.0/dist/web3.min.js";
document.head.appendChild(script);

script.onload = async function() {
    try {
        console.log("Initializing Web3...");

        // Verificar si MetaMask está disponible
        if (typeof window.web3 !== 'undefined' || typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum || window.web3.currentProvider);
            console.log("Web3 is available!");

            // Solicitar acceso a las cuentas
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (err) {
                    console.error("User denied account access");
                    return;
                }
            }

            // Obtener la cuenta actual
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                console.error("No accounts found. Make sure MetaMask is connected.");
                return;
            }
            const deployer = accounts[0];
            console.log(`Deployer Account: ${deployer}`);

            // Leer el contrato Solidity usando la API de Remix
            console.log("Reading Solidity contract...");
            const verifierSource = await remix.call('fileManager', 'readFile', 'contracts/zkp/verifier_stark.sol');
            const ellipticCurveSource = await remix.call('fileManager', 'readFile', 'contracts/zkp/EllipticCurve.sol');

            if (!verifierSource || !ellipticCurveSource) {
                throw new Error("Failed to read one or more contract files. Please check the file paths and ensure the files exist.");
            }
            //console.log("Verifier Source:", verifierSource);
            //console.log("EllipticCurve:", ellipticCurveSource);

            // Compilar el archivo EllipticCurve.sol primero
            console.log("Compiling EllipticCurve.sol...");
            await remix.call('solidity', 'compile', 'contracts/zkp/ellipticcurve.sol');

            // Luego compilar el contrato principal verifier_stark.sol
            console.log("Compiling verifier_stark.sol...");
            const compilationOutput = await remix.call('solidity', 'compile', 'contracts/zkp/verifier_stark.sol');

            // Verificar que la compilación haya tenido éxito
            if (!compilationOutput) {
                throw new Error("Compilation failed. The output is empty.");
            }

            // Parsear la salida de la compilación
            const contractName = Object.keys(compilationOutput.contracts['contracts/zkp/verifier_stark.sol'])[0];
            const contractData = compilationOutput.contracts['contracts/zkp/verifier_stark.sol'][contractName];

            const contractABI = contractData.abi;
            const contractBytecode = contractData.evm.bytecode.object;

            console.log('Contract compiled successfully.');
            console.log('ABI:', contractABI);
            console.log('Bytecode:', contractBytecode);


            // Variables de ejemplo
            const calculatedProofHash = "0x39f218e8e0689d376cdb18f2d67be5394e2c889951e006ede728e7b16bbd750f";
            const signature = "0x0fdc84266cdab637bf683740d34ef0281abd68d0aedec5af2f623c4cb3371c6f6c7dba63d3bc768f72fe0ab9e07e425e021b43cfef42bcf0b878a21e0d2bc8691b";
            const publicKeyHash = "0x67e0525f52a5a8462a13ac64a88b710fafff68e3d7bb4b3dd72c358b5bdb9a18";

            // Desplegar el contrato usando web3.js
            const VerifierContract = new web3.eth.Contract(contractABI);
            console.log("Deploying contract...");

            const deployParameters = {
                data: contractBytecode,
                arguments: [calculatedProofHash, publicKeyHash]
            };

            const gasEstimate = await VerifierContract.deploy(deployParameters).estimateGas({ from: deployer });
            const contractInstance = await VerifierContract.deploy(deployParameters)
                .send({ from: deployer, gas: gasEstimate });

            console.log("Contract deployed at:", contractInstance.options.address);

            // Medir el tiempo de ejecución de la verificación de firma
            const startTime = performance.now();
            const tx = await contractInstance.methods.verifySignature(calculatedProofHash, signature, publicKeyHash).send({ from: deployer });
            const endTime = performance.now();

            // Mostrar resultados
            console.log(`Execution time: ${endTime - startTime} ms`);
            console.log(`Gas used: ${tx.gasUsed}`);
        } else {
            console.error("Web3 is not available. Please make sure MetaMask is installed.");
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
};
