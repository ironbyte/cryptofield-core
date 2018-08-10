const SaleAuction = artifacts.require("./SaleAuction");
const Auctions = artifacts.require("./Auctions");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production"|| process.env.NODE_ENV === "testnet") {
    deployer.deploy(SaleAuction, Auctions.address);
  } else {
    deployer.deploy(SaleAuction, Auctions.address, {from: acc[1]});
  }
}