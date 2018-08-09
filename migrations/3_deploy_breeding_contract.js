const Breeding = artifacts.require("./Breeding");
const CToken = artifacts.require("./CToken");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production"|| process.env.NODE_ENV === "testnet") {
    deployer.deploy(Breeding, CToken.address);
  } else {
    deployer.deploy(Breeding, CToken.address, {from: acc[1]})
  }
}