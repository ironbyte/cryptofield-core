require("babel-register");
require("babel-polyfill");

if(process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env.mnemonic

module.exports = {
  solc: {
    optimizer: {
        enabled: true,
        runs: 200
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + process.env.infura_token)
      },
      network_id: 3,
      gas: 4712388
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/" + process.env.kovan_token)
      },
      network_id: 4,
      gas: 4712388
    }
  }
};
