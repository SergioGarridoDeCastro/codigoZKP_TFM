const { compileCairo } = require('starknet');
const { execSync } = require('child_process');
const { Account, Contract, defaultProvider, ec } = require('starknet');
const fs = require('fs');

// Rutas de los archivos
const cairoFilePath = 'path/to/circuitStark.cairo';
const compiledCairoFilePath = 'path/to/circuitStark.json';
const abiFilePath = 'path/to/circuitStark_abi.json';

// Compilar el contrato Cairo
function compileCairoContract() {
  try {
    execSync(`starknet-compile ${cairoFilePath} --output ${compiledCairoFilePath} --abi ${abiFilePath}`);
    console.log('Contrato Cairo compilado correctamente.');
  } catch (error) {
    console.error('Error al compilar el contrato Cairo:', error);
  }
}

// Desplegar el contrato en StarkNet
async function deployCairoContract() {
  const provider = defaultProvider;
  const privateKey = '0x...'; // Reemplaza con la clave privada
  const starkKeyPair = ec.getKeyPair(privateKey);
  const account = new Account(provider, starkKeyPair);

  const contractDefinition = JSON.parse(fs.readFileSync(compiledCairoFilePath).toString());
  const contract = new Contract(contractDefinition.abi);

  const deployResponse = await account.deploy(contractDefinition);
  console.log('Contrato desplegado en la dirección:', deployResponse.address);
  return deployResponse.address;
}

// Invocar la función validate_square para generar la prueba
async function invokeValidateSquare(contractAddress, a, b) {
  const provider = defaultProvider;
  const privateKey = '0x...'; // Reemplaza con la clave privada
  const starkKeyPair = ec.getKeyPair(privateKey);
  const account = new Account(provider, starkKeyPair);

  const abi = JSON.parse(fs.readFileSync(abiFilePath).toString());
  const contract = new Contract(abi, contractAddress, provider);

  const invokeResponse = await account.invoke(contract, 'validate_square', [a, b]);
  console.log('Prueba generada:', invokeResponse);
}

// Ejecutar el script
async function main() {
  compileCairoContract();
  const contractAddress = await deployCairoContract();
  await invokeValidateSquare(contractAddress, 3, 9); // Ejemplo de valores a y b
}

main().catch((error) => {
  console.error('Error en el script:', error);
});
