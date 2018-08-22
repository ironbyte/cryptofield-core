const Core = artifacts.require("./Core");

contract("CryptofieldBaseContract", accounts => {
  let instance;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let buyer = accounts[1];


  beforeEach("setup contract instance", async () => {
    instance = await Core.deployed();
  })

  it("should be able to buy a horse", async () => {
    await instance.createGOP(buyer, hash);
    let horse = await instance.getHorse.call(0)

    assert.equal(horse, hash);
  })

  it("should return the correct hash for a horse", async () => {
    let returnedHash = await instance.getHorse.call(0);

    assert.equal(hash, returnedHash);
  })
})
