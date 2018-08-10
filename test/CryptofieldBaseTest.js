const Auctions = artifacts.require("./Auctions");

contract("CryptofieldBaseContract", accounts => {
  let instance;
  let tokenInstance;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let buyer = accounts[1];
  let secondBuyer = accounts[2];
  let value = web3.toWei(1, "finney");


  beforeEach("setup contract instance", async () => {
    instance = await Auctions.deployed();
  })

  it("should be able to buy a horse", async () => {
    await instance.buyHorse(buyer, hash);
    let horses = await instance.getHorsesLength.call()

    assert.equal(horses, 1);
  })

  it("should add 1 to times sold when a given horse is sold", async () => {
    await instance.horseSold(0);
    let timesSold = await instance.horseAuctionInformation(0);

    assert.equal(timesSold[3].toString(), "1");
  })

  it("should return the correct hash for a horse", async () => {
    let returnedHash = await instance.getHorse.call(0);

    assert.equal(hash, returnedHash);
  })

  it("should return the whole family from a horse", async() => {
    let family = await instance.getHorseFamily(0);
    assert.deepEqual(family, [[], [], [], []])
  })

  // it("should revert when horseId is higher than the available horses", async () => {
  //   // OpenZeppelin implementation.
  //   try {
  //     await instance.auctionInformation(1234);
  //     assert.fail("Expected revert not received");
  //   } catch(err) {
  //     const revertFound = err.message.search("revert") >= 0;
  //     assert(revertFound, `Expected "revert", got ${err} instead`);
  //   }
  // })

  /*
  At this point, tests above that should returns array of horse's family
  always return an empty array because the horse we're using is a G1P.

  TODO: Do above tests again when we introduce breeding to have different return values.
  */
})
