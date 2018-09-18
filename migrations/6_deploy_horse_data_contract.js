const HorseData = artifacts.require("./HorseData");

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    deployer.deploy(HorseData);
  } else {
    deployer.deploy(HorseData, { from: acc[1] });
  }
}