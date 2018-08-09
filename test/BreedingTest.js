const Breeding = artifacts.require("./Breeding");
const CToken = artifacts.require("./CToken");

contract("Breeding", acc => {
  let instance;
  let token;
  let owner = acc[1];

  before(() => {
    instance = await Breeding.deployed();
    token = await CToken.deployed();

    // Creating a genesis token since we can't mix with a genesis horse.
    await token.createHorse(owner, "first hash"); 
  })

  it("should init a new horse", async () => {
    await instance.initHorse(0, 1212);

    let tracking = await instance.getTrackingNumber.call(0);

    assert.equal(tracking, 1212);
  })

  it("should mix two horses", async () => {
    // Mint two tokens.
    await token.createHorse(owner, "hash");
    await token.createHorse(owner, "another hash");

    await instance.mix(1, 2, {from: acc[1]}); // This should create another token with other stuff specified.

    let owner = await token.ownerOf(3);
    assert.equal(owner, acc[1]);
  })
})