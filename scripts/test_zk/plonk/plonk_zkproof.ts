const ethers = require('ethers');
const readline = require('readline');


const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
};

interface Proof {
  A: string[];
  B: string[];
  C: string[];
  Z: string[];
  T1: string[];
  T2: string[];
  T3: string[];
  Wxi: string[];
  Wxiw: string[];
  eval_a: string;
  eval_b: string;
  eval_c: string;
  eval_s1: string;
  eval_s2: string;
  eval_zw: string;
}

(async () => {
  try {
    // Establecer manualmente los valores de 'a' y 'b'
    const input = {
      a: 3, // Valor de 'a'
      b: 9  // Valor de 'b'
    };

    console.time('Execution Time');

    // Compilar el circuito con Remix plugin (usando @ts-ignore si es necesario)
    // @ts-ignore
    await remix.call('circuit-compiler', 'compile', 'circuits/zk/plonk.circom');

    // Leer el archivo .wasm y la clave zkey_final
    // @ts-ignore
    const wasmBuffer: ArrayBuffer = await remix.call('fileManager', 'readFile', 'circuits/zk/.bin/plonk.wasm', { encoding: null });
    const wasm = new Uint8Array(wasmBuffer);

    const zkeyFinalBuffer = await remix.call('fileManager', 'readFile', './zk/keys/plonk/zkey_final.txt');
    const zkeyFinal = { type: "mem", data: new Uint8Array(JSON.parse(zkeyFinalBuffer)) };

    const wtns = { type: "mem" };

    // Calcular el testigo (witness)
    logger.info('Calculating witness...');
    await snarkjs.wtns.calculate(input, wasm, wtns, logger);

    const start = performance.now();

    // Generar la prueba (proof)
    logger.info('Generating proof...');
    const { proof, publicSignals } = await snarkjs.plonk.prove(zkeyFinal, wtns);
    if (!proof) {
        throw new Error("Proof generation failed. Proof is undefined.");
    }
    logger.info("Proof", proof);


    const end = performance.now();
    logger.info(`Proof Generation Time: ${end - start} ms`);
    // Medir el tamaño de la prueba
    const proofSize = new Blob([JSON.stringify(proof)]).size;
    console.log(`Proof Size: ${proofSize} bytes`);    

    // Leer la clave de verificación
    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/keys/plonk/verification_key.json'));

    // Verificar la prueba
    logger.info('Verifying proof...');
    const verified = await snarkjs.plonk.verify(vKey, publicSignals, proof);
    logger.info('zk proof validity', verified);

    // Convertir cada valor a hexadecimal
    const hexProof = [
        proof.A[0], proof.A[1], 
        proof.B[0], proof.B[1], 
        proof.C[0], proof.C[1], 
        proof.Z[0], proof.Z[1], 
        proof.T1[0], proof.T1[1], 
        proof.T2[0], proof.T2[1], 
        proof.T3[0], proof.T3[1], 
        proof.Wxi[0], proof.Wxi[1], 
        proof.Wxiw[0], proof.Wxiw[1], 
        proof.eval_a,             
        proof.eval_b,             
        proof.eval_c,             
        proof.eval_s1,            
        proof.eval_s2,            
        proof.eval_zw             
    ];

    logger.info('Proof in hex format:', hexProof);

    console.timeEnd('Execution Time');

    // Exportar el contrato verificador de Solidity
    logger.info('Exporting Solidity verifier contract...');
    const templates = {
      plonk: await remix.call('fileManager', 'readFile', 'templates/plonk_verifier.sol.ejs'),
    };
    const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkeyFinal, templates);

    // Guardar el contrato verificador de Solidity
    await remix.call('fileManager', 'writeFile', 'zk/build/plonk/zk_verifier.sol', solidityContract);

    // Guardar la prueba y las señales públicas
    await remix.call('fileManager', 'writeFile', 'zk/build/plonk/input.json', JSON.stringify({
      _proof: hexProof,
      _pubSignals: publicSignals,
    }, null, 2));

    logger.info('Proof and verifier contract saved.');
    console.log('Proof generation done.');

  } catch (e) {
    console.error('Error:', e.message);
  }
})();