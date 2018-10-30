/*
  Initial setup for the contracts.
*/
/*const C = require("../build/contracts/Core.json");
const B = require("../build/contracts/Breeding.json");
const HD = require("../build/contracts/HorseData.json");
const GOPC = require("../build/contracts/GOPCreator.json");
const contract = require("truffle-contract");
const web3 = require("web3");*/

/*const Core = contract(C);
const Breeding = contract(B);
const HorseData = contract(HD);
const GOPCreator = contract(GOPC);

Core.setProvider(web3.currentProvider);
Breeding.setProvider(web3.currentProvider);
HorseData.setProvider(web3.currentProvider);
GOPCreator.setProvider(web3.currentProvider);*/

/*let acc;

web3.eth.getAccounts((err, res) => { acc = res });*/
const Core = artifacts.require("./Core");
const Breeding = artifacts.require("./Breeding");
const HorseData = artifacts.require("./HorseData");
const GOPCreator = artifacts.require("./GOPCreator");
const SaleAuction = artifacts.require("./SaleAuction");
const value = "2000000000000000000"

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    Core.deployed().then(i => {
      i.setBreedingAddr(Breeding.address);
      i.setHorseDataAddr(HorseData.address);
      i.setGOPCreator(GOPCreator.address);
      i.setNft(SaleAuction.address);
    })
  } else {
    Core.deployed().then(i => {
      i.setBreedingAddr(Breeding.address, {from: acc[1]});
      i.setHorseDataAddr(HorseData.address, {from: acc[1]});
      i.setGOPCreator(GOPCreator.address, {from: acc[1]});
      i.setNft(SaleAuction.address, {from: acc[1]});
    })

    GOPCreator.deployed().then(i => { return i.openBatch(2, {from: acc[1]}) })

    for(let i = 0; i < 50; i++) {
      GOPCreator.deployed().then(i => { return i.createGOP(acc[1], "some hash", {from: acc[1], value: value}) })
    }
  }
}
