const Core = artifacts.require("./Core");

contract("CryptofieldBaseContract", accounts => {
  let core;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let buyer = accounts[1];
  let defaults = [
    "Austin Riffle", "Jerri Curl", "Amoxi", "Chase Jackson", "Zeus", "Apollo"
  ];


  beforeEach("setup contract instance", async () => {
    core = await Core.deployed();
  })

  it("should be able to buy a horse", async () => {
    await core.createGOP(buyer, hash);
    let horse = await core.getHorseHash.call(0)

    assert.equal(horse, hash);
  })

  it("should return the correct hash for a horse", async () => {
    let returnedHash = await core.getHorseHash.call(0);

    assert.equal(hash, returnedHash);
  })

  it("should contain one of the default names for GOP", async () => {
    let horseName = await core.getHorseName.call(0);
    assert.include(defaults, horseName);
  })
})
