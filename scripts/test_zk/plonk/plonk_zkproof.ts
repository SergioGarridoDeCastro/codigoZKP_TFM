const ethers = require('ethers');

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
};

(async () => {
  try {
    // @ts-ignore
    await remix.call('circuit-compiler', 'compile', 'circuits/zk/plonk.circom');
    // @ts-ignore
    const wasmBuffer = await remix.call('fileManager', 'readFile', 'circuits/zk/.bin/plonk.wasm', { encoding: null });
    // @ts-ignore
    const wasm = new Uint8Array(wasmBuffer);
    const zkey_final = {
      type: "mem",
      data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/keys/plonk/zkey_final.txt')))
    }

        // Datos de entrada para la prueba
    const input = {
      "a": 3,
      "b": 9
    };
    const wtns = { type: "mem" };

    // Calcular el testigo
    logger.info('Calculating witness...');
    await snarkjs.wtns.calculate(input, wasm, wtns, logger);

    // Generar la prueba
    logger.info('Generating proof...');
    const { proof, publicSignals } = await snarkjs.plonk.prove(zkey_final, wtns);

    // Leer la clave de verificación
    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/keys/plonk/verification_key.json'))

    // Verificar la prueba
    logger.info('Verifying proof...');
    const verified = await snarkjs.plonk.verify(vKey, publicSignals, proof);
    logger.info('zk proof validity', verified);

    // Exportar el contrato verificador de Solidity
    logger.info('Exporting Solidity verifier contract...');
    const templates = {
      plonk: await remix.call('fileManager', 'readFile', 'templates/plonk_verifier.sol.ejs')
    }
    const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates);

    // Guardar el contrato verificador de Solidity
    await remix.call('fileManager', 'writeFile', 'zk/build/plonk/zk_verifier.sol', solidityContract)

    // Guardar la prueba y las señales públicas
    await remix.call('fileManager', 'writeFile', 'zk/build/plonk/input.json', JSON.stringify({
      _proof: [
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.A[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.A[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.B[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.B[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.C[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.C[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Z[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Z[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T1[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T1[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T2[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T2[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T3[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T3[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxi[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxi[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxiw[0]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxiw[1]).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_a).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_b).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_c).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_s1).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_s2).toHexString(), 32),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_zw).toHexString(), 32),
      ],
      _pubSignals: publicSignals
    }, null, 2))
    logger.info('Proof and verifier contract saved.')
    console.log('proof done.')
    
  } catch (e) {
    console.error(e.message)
  }
})()
