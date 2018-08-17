const Breeding = artifacts.require("./Breeding");
const Core = artifacts.require("./Core");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production"|| process.env.NODE_ENV === "testnet") {
    deployer.deploy(Breeding, Core.address);
  } else {
    deployer.deploy(Breeding, Core.address, {from: acc[1]});
  }
}