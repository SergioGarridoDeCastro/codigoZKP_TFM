// Programa en Cairo para verificar a * a = b
#[starknet::interface]
trait IStark<ContractState> {
    fn validate_square(self: @ContractState, a: felt252, b: felt252) -> bool;
}

#[starknet::contract]
mod circuitStark{
    // Each contract has to have storage setup - even if it's not used
    #[storage]
    struct Storage {

    }

    // Implementing this trait exposes the function as a public function inside the contract
    #[abi(embed_v0)]
    impl PublicFunctions of super::IStark<ContractState> {
        fn validate_square(self: @ContractState, a: felt252, b: felt252) -> bool {
            let mul = a * a;
            //assert(mul, b);
            return mul == b;
        }
    }
}
