(async function() {
    const snarkjs = await import("https://cdn.jsdelivr.net/npm/snarkjs@0.5.0/dist/snarkjs.min.js");

    // Cargar los archivos preprocesados en Remix IDE
    const circuitWasm = await fetch("circuit.wasm").then(res => res.arrayBuffer());
    const zkey = await fetch("circuit_final.zkey").then(res => res.arrayBuffer());
    const witnessJson = await fetch("witness.json").then(res => res.json());

    console.log("Starting PLONK proof generation...");

    // Generar la prueba
    const { proof, publicSignals } = await snarkjs.plonk.prove(new Uint8Array(zkey), witnessJson);

    console.log("Proof generated:");
    console.log(proof);
    console.log("Public Signals:");
    console.log(publicSignals);

    // Verificar la prueba
    const vKeyJson = await fetch("verification_key.json").then(res => res.json());
    const isValid = await snarkjs.plonk.verify(vKeyJson, publicSignals, proof);

    if (isValid) {
        console.log("Proof is valid!");
    } else {
        console.log("Proof is invalid!");
    }
})();
