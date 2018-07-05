require("babel-register")({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});

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
      network_id: "*"
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + process.env.infura_token)
      },
      network_id: 3
    }
  }
};
