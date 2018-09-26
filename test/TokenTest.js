const Core = artifacts.require("./Core");
const Breeding = artifacts.require("./Breeding");
const GOPCreator = artifacts.require("./GOPCreator");
const HorseData = artifacts.require("HorseData");

// TODO: TESTS FOR BASE VALUE, CHECK IF IT SHOULD STAY IN THIS FILE

contract("Token", acc => {
  let instance, breed, query, gop, hd;
  let owner = acc[1];
  let secondBuyer = acc[2];
  let amount = web3.toWei(0.40, "ether");

  before("setup instance", async () => {
    instance = await Core.deployed();
    breed = await Breeding.deployed();
    gop = await GOPCreator.deployed();
    hd = await HorseData.deployed();

    await instance.setGOPCreator(gop.address, { from: owner });
    await instance.setBreedingAddr(breed.address, { from: owner });
    await instance.setHorseDataAddr(hd.address, { from: owner });

    await gop.openBatch(1, { from: owner });

    query = await instance.getQueryPrice.call();
  })

  it("should mint a new token with specified params", async () => {
    await gop.createGOP(owner, "male hash", { from: owner, value: amount }); // 0
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
    await instance.safeTransferFrom(owner, secondBuyer, 0, { from: owner });
    let newTokenOwner = await instance.ownerOf(0);

    assert.equal(secondBuyer, newTokenOwner);
  })

  it("should transfer ownershp of the contract", async () => {
    let newOwner = acc[5];

    let op = await instance.transferOwnership(newOwner, { from: owner });
    let loggedOwner = op.logs[0].args.newOwner;

    assert.equal(loggedOwner, newOwner);
  })

  it("should use the given name if one is passed", async () => {
    await gop.createGOP(owner, "female hash", { from: owner, value: amount }); // 1
    await gop.createGOP(acc[2], "male hash", { from: acc[2], value: amount }); // 2

    await instance.putInStud(2, amount, 1, { from: acc[2], value: query });

    await breed.mix(2, 1, "female offspring hash", { from: owner, value: amount }); // 3

    await instance.setName("Spike", 3, { from: owner }); // This is only possible for offsprings.
    let name = await instance.getHorseData.call(3);

    assert.equal(name[4], "Spike");
  })

  it("should generate a random name if no name is given", async () => {
    await breed.mix(2, 1, "male offspring hash", { from: owner, value: amount }); // 4
    // We're just going to pass an empty string from the front-end.
    await instance.setName("", 4, { from: owner })
    let name = await instance.getHorseData.call(2);

    assert.notEqual(name[4], "");
  })

  it("should revert if a name is already given for an offspring/GOP", async () => {
    await breed.mix(2, 1, "female offspring hash", { from: owner, value: amount }); // 5
    await instance.setName("Odds", 5, { from: owner });

    try {
      await instance.setName("Icy", 5, { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should select the correct range of base value depending on the gen", async () => {
    await gop.createGOP(owner, "some hash", { from: owner, value: amount }); // 6

    let baseValue = await instance.getBaseValue.call(6)
    assert.isAtLeast(baseValue.toNumber(), 95) && assert.isAtMost(baseValue.toNumber(), 99);

    await gop.closeBatch(1, { from: owner });
    await gop.openBatch(2, { from: owner });

    await gop.createGOP(owner, "some hash", { from: owner, value: amount }); // 7

    baseValue = await instance.getBaseValue.call(7);

    assert.isAtLeast(baseValue.toNumber(), 80) && assert.isAtMost(baseValue.toNumber(), 89);
  })
})
