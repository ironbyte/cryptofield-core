// const Breeding = artifacts.require("./Breeding");
const Core = artifacts.require("./Core");

contract("Breeding", acc => {
  let core;
  let owner = acc[1];

  before(async () => {
    core = await Core.deployed();

    // Creating a genesis token since we can't mix with a genesis horse.
    await core.createHorse(owner, "male hash"); // 0 Genesis token
  })
  
  // TODO: Fix test
  it("should mix two horses", async () => {
    // Mint two tokens.
    await core.createHorse(owner, "female hash"); // 1
    await core.createHorse(acc[2], "male hash"); // 2

    // This should create another token with other stuff specified.
    await core.mix(2, 1, "female offspring hash", {from: owner}); // 3

    let firstOffspringStats = await core.getHorseOffspringStats.call(1)
    let secondOffspringStats = await core.getHorseOffspringStats.call(2);

    assert.equal(firstOffspringStats[0].toNumber(), 1);
    assert.equal(secondOffspringStats[0].toNumber(), 1);

    let offspringSex = await core.getHorseSex.call(3);
    assert.equal(web3.toUtf8(offspringSex), "F");

    // Ensure the owner is the owner of the female horse
    let ownerOfToken = await core.ownerOf.call(3);
    assert.equal(ownerOfToken, owner);
  })

  it("should revert when mixing with a horse in the same lineage", async () => {
    // Offspring created in the last test
    try {
      await core.mix(2, 3, "failed female hash", {from: acc[2]});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when horses are related in lineages", async () => {
    await core.createHorse(owner, "hash"); // 4
    // By design, horses can't mate with a horse of the same gender.
    // Horses of the same gender and in the same block will have the same timestamp.
    // Mating with two horses from the same block isn't possible.
    await core.mix(4, 3, "female hash", {from: owner}); // 5

    try {
      await core.mix(2, 4, "failed female hash", {from: owner}); // Failed
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should create a base value for the offspring", async () => {
    let baseValue = await core.getBaseValue.call(5); 
    assert.notEqual(baseValue.toNumber(), 0);
    assert.isBelow(baseValue.toNumber(), 50);
  })
})