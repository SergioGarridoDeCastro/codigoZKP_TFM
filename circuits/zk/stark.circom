pragma circom 2.0.0;

template circuit() {
    signal input a;
    signal input b;
    signal output out;

    out <== a * a;
    b === out;
}

component main = circuit();