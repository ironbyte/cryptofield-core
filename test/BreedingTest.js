// const Breeding = artifacts.require("./Breeding");
const Breeding = artifacts.require("./Breeding");
const Core = artifacts.require("./Core");

contract("Breeding", acc => {
  let core, instance;
  let owner = acc[1];

  before(async () => {
    core = await Core.deployed();
    instance = await Breeding.deployed();

    // Creating a genesis token since we can't mix with a genesis horse.
    await core.createGOP(owner, "male hash"); // 0 Genesis token
  })
  
  it("should mix two horses", async () => {
    // Mint two tokens.
    await core.createGOP(owner, "female hash"); // 1
    await core.createGOP(owner, "male hash"); // 2

    // This should create another token with other stuff specified.
    await instance.mix(2, 1, "female offspring hash", {from: owner}); // 3

    let firstOffspringStats = await instance.getHorseOffspringStats.call(1);
    let secondOffspringStats = await instance.getHorseOffspringStats.call(2);

    assert.equal(firstOffspringStats[0].toNumber(), 1);
    assert.equal(secondOffspringStats[0].toNumber(), 1);

    let offspringSex = await core.getHorseSex.call(3);
    assert.equal(web3.toUtf8(offspringSex), "F");

    // Ensure the owner is the owner of the female horse
    let ownerOfToken = await core.ownerOf.call(3);
    assert.equal(ownerOfToken, owner);
  })

  it("should create a base value for the offspring", async () => {
    let baseValue = await core.getBaseValue.call(3); 
    assert.notEqual(baseValue.toNumber(), 0);
    assert.isBelow(baseValue.toNumber(), 50);
  })

  it("should return the correct genotype for a given horse", async () => {
    // At this point we're going to use two ZED 1 (0) horses
    await core.createGOP(owner, "male hash"); // 4
    await instance.mix(4, 1, "female offspring hash", {from: owner}); // 5

    let genotype = await core.getGenotype.call(5); // At this point parents had 1 and 1 as genotype.
    assert.equal(genotype.toNumber(), 2);
  })

  // Maybe same as above tests but with a more direct approach
  it("should revert when mixing two offsprings from the same parents", async () => {
    await instance.mix(4, 1, "male offspring hash", {from: owner}); // 6

    // Mixing the two horses from the same parents (5 and 6)
    try {
      await instance.mix(6, 5, "failed female hash", {from: owner});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when mixing an offspring with a parent", async () => {
    // Mix 5 with 4, 5 being offspring of 4.
    try {
      await instance.mix(4, 5, "failed female hash", {from: owner});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when mixing two horses with the same sex", async () => {
    await core.createGOP(owner, "female hash"); // 7
    // 1 and 7 are two females and not related, if the second parameter isn't a female horse it'll throw.
    try {
      await instance.mix(1, 3, "failed male hash", {from: owner});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when the second parameter isn't a female horse", async () => {
    try {
      await instance.mix(1, 4, "failed male hash", {from: owner});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })
})