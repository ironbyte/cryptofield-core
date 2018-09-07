const Core = artifacts.require("./Core.sol");

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    deployer.deploy(Core);
  } else {
    deployer.deploy(Core, { from: acc[1] });
  }
}
