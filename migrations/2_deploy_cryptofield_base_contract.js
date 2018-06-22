var CryptofieldBase = artifacts.require("./CryptofieldBase.sol");

module.exports = deployer => {
  deployer.deploy(CryptofieldBase);
}
