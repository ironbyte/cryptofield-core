var CryptofieldBase = artifacts.require("./CryptofieldBase.sol");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production") {
    deployed.deploy(CryptofieldBase);
  } else {
    deployer.deploy(CryptofieldBase, {from: acc[1]});
  }
}
