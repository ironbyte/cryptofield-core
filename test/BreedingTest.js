const Breeding = artifacts.require("./Breeding");
const Core = artifacts.require("./Core");

contract("Breeding", acc => {
  let core;
  let owner = acc[1];

  before(async () => {
    core = await Core.deployed();

    // Creating a genesis token since we can't mix with a genesis horse.
    await core.createHorse(owner, "first hash");
  })

  it("should mix two horses", async () => {
    // Mint two token.
    await core.createHorse(owner, "hash");
    await core.createHorse(owner, "another hash");

    await core.mix(1, 2, {from: acc[1]}); // This should create another token with other stuff specified.

    let firstOffspringStats = await core.getHorseOffspringStats.call(1)
    let secondOffspringStats = await core.getHorseOffspringStats.call(2);)

    assert.equal(firstOffspringStats[0].toNumber(), 1);
    assert.equal(secondOffspringStats[0].toNumber(), 1);
  })
})