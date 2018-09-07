const GOPCreator = artifacts.require("./GOPCreator");
const Core = artifacts.require("./Core");

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    deployer.deploy(GOPCreator, Core.address);
  } else {
    deployer.deploy(GOPCreator, Core.address, { from: acc[1] });
  }
}