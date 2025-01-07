require("@nomicfoundation/hardhat-toolbox");

const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    ontology_testnet: {
        url: "http://polaris2.ont.io:20339",
        chainId: 5851,
        accounts: [privateKey],
        allowUnlimitedContractSize: true
    },
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [privateKey],
      chainId: 5,
      allowUnlimitedContractSize: true
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/069b7d73ec604e52a5092610c9f410ea",
      accounts: [privateKey],
      chainId:11155111,
      allowUnlimitedContractSize: true
    }
  },
};
