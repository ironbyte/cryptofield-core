const Auctions = artifacts.require("./Auctions.sol");
const CToken = artifacts.require("./CToken.sol");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production") {
    deployer.deploy(Auctions, CToken.address);
  } else {
    deployer.deploy(Auctions, CToken.address, {from: acc[1]});
  }
}