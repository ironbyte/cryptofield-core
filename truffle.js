require("babel-register");
require("babel-polyfill");

if (process.env.NODE_ENV !== "production") {
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
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + process.env.infura_token, 0, 10)
      },
      network_id: 3,
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/" + process.env.kovan_token)
      },
      network_id: 4,
    }
  }
};
