var Horse = artifacts.require("./Horse.sol");

module.exports = deployer => {
  deployer.deploy(Horse);
}
