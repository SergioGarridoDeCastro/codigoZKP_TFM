# extern crate bulletproofs;
extern crate curve25519_dalek;
extern crate merlin;
extern crate rand;

use bulletproofs::r1cs::{Prover, Verifier};
use bulletproofs::BulletproofGens;
use bulletproofs::PedersenGens;
use curve25519_dalek::scalar::Scalar;
use merlin::Transcript;
use rand::thread_rng;

fn main() {
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(64, 1);

    let mut prover_transcript = Transcript::new(b"Example");

    let mut prover = Prover::new(&pc_gens, &mut prover_transcript);

    let (commit, var) = prover.commit(Scalar::from(3u64), Scalar::random(&mut thread_rng()));

    prover.constrain(var - (var * var));

    let proof = prover.prove(&bp_gens).unwrap();

    let mut verifier_transcript = Transcript::new(b"Example");

    let mut verifier = Verifier::new(&mut verifier_transcript);

    let var = verifier.commit(commit);

    verifier.constrain(var - (var * var));

    assert!(verifier.verify(&proof, &pc_gens, &bp_gens).is_ok());
}
