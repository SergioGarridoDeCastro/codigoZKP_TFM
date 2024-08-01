import { task } from "hardhat/config";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import "@nomiclabs/hardhat-waffle";

const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});

const {HARMONY_PRIVATE_KEY} = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      gas: 100000000,
      blockGasLimit: 0x1fffffffffffff
    },
    testnet: {
      url: "https://api.s0.b.hmny.io",
      chainId: 1666700000,
      accounts: [`${HARMONY_PRIVATE_KEY}`]
    },
    devnet: {
      url: "https://api.s0.ps.hmny.io",
      chainId: 1666900000,
      accounts: [`${HARMONY_PRIVATE_KEY}`]
    },
    mainnet: {
      url: "https://api.s0.t.hmny.io",
      chainId: 1666600000,
      accounts: [`${HARMONY_PRIVATE_KEY}`]
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./contracts/artifacts",
  },
  typechain: {
    outDir: './lib/types/typechain',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 100000000
  },
