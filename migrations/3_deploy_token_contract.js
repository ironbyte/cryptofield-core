const CToken = artifacts.require("./CToken.sol");

module.exports = deployer => {
  deployer.deploy(CToken);
}