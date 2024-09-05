// Incluir la biblioteca de ZoKrates desde un CDN
const script = document.createElement('script');
script.src = "https://unpkg.com/zokrates-js@latest/umd.min.js";
document.head.appendChild(script);

script.onload = function() {
  zokrates.initialize().then(async (zokratesProvider) => {
    const source = `
    def main(private field a, field b) -> field {
        field result = a * b;
        return result;
    }`;

    try {
      const startTotal = performance.now();
      
      // Compilar el circuito
      const startCompile = performance.now();
      const artifacts = zokratesProvider.compile(source);
      const endCompile = performance.now();
      console.log(`Compile Time: ${endCompile - startCompile} ms`);

      // Generar testigos (witness)
      const startWitness = performance.now();
      const { witness, output } = zokratesProvider.computeWitness(artifacts, ["3", "9"]);
      const endWitness = performance.now();
      console.log(`Witness Generation Time: ${endWitness - startWitness} ms`);
      console.log("Output of the circuit:", output); // Debería ser "27"

      // Ejecutar setup (configuración)
      const startSetup = performance.now();
      const keypair = zokratesProvider.setup(artifacts.program);
      const endSetup = performance.now();
      console.log(`Setup Time: ${endSetup - startSetup} ms`);

      // Generar la prueba
      const startProof = performance.now();
      const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
      const endProof = performance.now();
      console.log(`Proof Generation Time: ${endProof - startProof} ms`);

      // Mostrar la prueba generada en la consola
      console.log("Generated Proof:", proof);

      // Medir el tamaño de la prueba
      const proofSize = new Blob([JSON.stringify(proof)]).size;
      console.log(`Proof Size: ${proofSize} bytes`);

      const startVerifier = performance.now();
      const verifierContract = zokratesProvider.exportSolidityVerifier(keypair.vk);
      const endVerifier = performance.now();
      console.log(`Verifier Export Time: ${endVerifier - startVerifier} ms`);

      const endTotal = performance.now();
      console.log(`Total Execution Time: ${endTotal - startTotal} ms`);

      // Guardar la prueba y el contrato verificador en Remix
      await remix.call('fileManager', 'writeFile', 'zk/proof.json', JSON.stringify(proof, null, 2));
      await remix.call('fileManager', 'writeFile', 'zk/verifier.sol', verifierContract);

      console.log('Proof and verifier contract saved.');

    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
};
