const CToken = artifacts.require("./CToken.sol");
const CryptofieldBase = artifacts.require("./CryptofieldBase.sol");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production") {
    deployer.deploy(CToken, CryptofieldBase.address);
  } else {
    deployer.deploy(CToken, CryptofieldBase.address, {from: acc[1]});
  }
}