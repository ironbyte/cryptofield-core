const CToken = artifacts.require("./CToken.sol");
const CryptofieldBase = artifacts.require("./CryptofieldBase.sol");

module.exports = deployer => {
  deployer.deploy(CToken, CryptofieldBase.address);
}