const Core = artifacts.require("./Core");
const Breeding = artifacts.require("./Breeding");
const HorseData = artifacts.require("./HorseData");
const GOPCreator = artifacts.require("./GOPCreator");
const SaleAuction = artifacts.require("./SaleAuction");
const value = "2000000000000000000"

module.exports = (deployer, network, acc) => {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    Core.deployed().then(i => {
      i.setBreedingAddr(Breeding.address);
      i.setHorseDataAddr(HorseData.address);
      i.setGOPCreator(GOPCreator.address);
      i.setSaleAuctionAddress(SaleAuction.address);
    })
  } else if (process.env.NODE_ENV === "test") {
    Core.deployed().then(i => {
      i.setBreedingAddr(Breeding.address, { from: acc[1] });
      i.setHorseDataAddr(HorseData.address, { from: acc[1] });
      i.setGOPCreator(GOPCreator.address, { from: acc[1] });
      i.setSaleAuctionAddress(SaleAuction.address, { from: acc[1] });
    })
  } else {
    Core.deployed().then(i => {
      i.setBreedingAddr(Breeding.address, { from: acc[1] });
      i.setHorseDataAddr(HorseData.address, { from: acc[1] });
      i.setGOPCreator(GOPCreator.address, { from: acc[1] });
      i.setSaleAuctionAddress(SaleAuction.address, { from: acc[1] });
    })

    GOPCreator.deployed().then(i => { return i.openBatch(2, { from: acc[1] }) })

    for (let i = 0; i < 50; i++) {
      GOPCreator.deployed().then(i => { return i.createGOP(acc[1], "some hash", { from: acc[1], value: value }) })
    }
  }
}
