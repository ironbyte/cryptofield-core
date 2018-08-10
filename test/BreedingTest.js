const Breeding = artifacts.require("./Breeding");
const Auctions = artifacts.require("./Auctions");

contract("Breeding", acc => {
  let instance;
  let core;
  let owner = acc[1];

  before(async () => {
    instance = await Breeding.deployed();
    core = await Auctions.deployed();

    // Creating a genesis token since we can't mix with a genesis horse.
    await core.createHorse(owner, "first hash");
  })

  it("should init a new horse", async () => {
    await instance.initHorse(0, 1212);

    let tracking = await instance.getTrackingNumber.call(0);

    assert.equal(tracking, 1212);
  })

  // it("should mix two horses", async () => {
  //   // Mint two token.
  //   await core.createHorse(owner, "hash");
  //   await core.createHorse(owner, "another hash");

  //   await instance.mix(1, 2, {from: acc[1]}); // This should create another token with other stuff specified.

  //   let owner = await core.ownerOf(3);
  //   assert.equal(owner, acc[1]);
  // })
})