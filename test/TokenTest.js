const Core = artifacts.require("./Core");
const Breeding = artifacts.require("./Breeding");

contract("Token", acc => {
  let instance, breed;
  let owner = acc[1];
  let secondBuyer = acc[2];

  beforeEach("setup instance", async () => {
    instance = await Core.deployed();
    breed = await Breeding.deployed();
  })

  it("should mint a new token with specified params", async () => {
    await instance.createGOP(owner, "male hash"); // 0
    let tokenOwner = await instance.ownerOf(0);

    assert.equal(tokenOwner, owner);
  })

  it("should return the owned tokens of an address", async () => {
    let tokens = await instance.getOwnedTokens(owner);

    // This returns the token IDS in an array, not the amount of tokens.
    assert.equal(tokens.toString(), "0");
  })

  it("should be able to transfer a token", async () => {
    // 'owner' has token 0.
    await instance.safeTransferFrom(owner, secondBuyer, 0, {from: owner});
    let newTokenOwner = await instance.ownerOf(0);

    assert.equal(secondBuyer, newTokenOwner);
  })

  it("should transfer ownershp of the contract", async () => {
    let newOwner = acc[5];

    let op = await instance.transferOwnership(newOwner, {from: owner});
    let loggedOwner = op.logs[0].args.newOwner;

    assert.equal(loggedOwner, newOwner);
  })

  it("should use the given name if one is passed", async () => {
    await instance.createGOP(owner, "female hash"); // 1
    await instance.createGOP(owner, "male hash"); // 2
    await breed.mix(2, 1, "female offspring hash", {from: owner}); // 3

    await instance.setName("Spike", 3, {from: owner}); // This is only possible for offsprings.
    let name = await instance.getHorseName.call(3);
    
    assert.equal(name, "Spike");
  })

  it("should generate a random name if no name is given", async () => {
    await breed.mix(2, 1, "male offspring hash", {from: owner}); // 4
    // We're just going to pass an empty string from the front-end.
    await instance.setName("", 4, {from: owner})
    let name = await instance.getHorseName.call(2);

    assert.notEqual(name, "");
  })

  it("should revert if a name is already given for an offspring/GOP", async () => {
    await breed.mix(2, 1, "female offspring hash", {from: owner}); // 5
    await instance.setName("Odds", 5, {from: owner});

    try {
      await instance.setName("Icy", 5, {from: owner});
      assert.fail("Expected revert not received");
    } catch(err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("create correct genotype based on number of sale", async () => {
    // If we get the first one, we should have genotype 1.
    let genotype = await instance.getGenotype.call(0);
    assert.equal(genotype.toNumber(), 1);

    for(let i = 1; i <= 110; i++) {
      // We're going to create 700 horses so we have a different genotype
      await instance.createGOP(owner, "random hash");
    }

    genotype = await instance.getGenotype.call(100);
    assert.equal(genotype.toNumber(), 1);

    let genotype2 = await instance.getGenotype.call(101);
    assert.equal(genotype2.toNumber(), 2);
  })
})
