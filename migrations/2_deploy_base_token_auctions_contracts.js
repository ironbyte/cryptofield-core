const CryptofieldBase = artifacts.require("./CryptofieldBase.sol");
const CToken = artifacts.require("./CToken.sol");
const Auctions = artifacts.require("./Auctions.sol");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production"|| process.env.NODE_ENV === "testnet") {
    deployer.deploy(CryptofieldBase)
    .then(base => { return deployer.deploy(CToken, CryptofieldBase.address); })
    .then(token => { return deployer.deploy(Auctions, CToken.address); })
  } else {
    deployer.deploy(CryptofieldBase, {from: acc[1]})
    .then(base => { return deployer.deploy(CToken, CryptofieldBase.address, {from: acc[1]}); })
    .then(token => { return deployer.deploy(Auctions, CToken.address, {from: acc[1]}); })
  }
}
