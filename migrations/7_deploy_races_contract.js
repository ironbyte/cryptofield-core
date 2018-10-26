const Races = artifacts.require("./Races");

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    deployer.deploy(Races);
  } else {
    deployer.deploy(Races, { from: acc[1] });
  }
}