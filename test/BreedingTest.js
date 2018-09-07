const Breeding = artifacts.require("./Breeding");
const Core = artifacts.require("./Core");
const GOPCreator = artifacts.require("GOPCreator");

contract("Breeding", acc => {
  let core, instance, query, gop;
  let owner = acc[1];
  let amount = web3.toWei(0.5, "ether");

  before(async () => {
    core = await Core.deployed();
    instance = await Breeding.deployed();
    gop = await GOPCreator.deployed();

    await core.setBreedingAddr(instance.address, { from: owner });
    await core.setGOPCreator(gop.address, { from: owner });

    await gop.openBatch(1, { from: owner });

    // Creating a genesis token since we can't mix with a genesis horse.
    await gop.createGOP(owner, "male hash", { from: owner }); // 0 Genesis token

    query = await core.getQueryPrice.call();
  })

  it("should mix two horses", async () => {
    // Mint two tokens.
    await gop.createGOP(owner, "female hash", { from: owner }); // 1
    await gop.createGOP(owner, "male hash", { from: owner }); // 2

    await core.putInStud(2, amount, 1000, { from: owner, value: query });

    // This should create another token with other stuff specified.
    await instance.mix(2, 1, "female offspring hash", { from: owner, value: amount }); // 3

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
    await gop.createGOP(owner, "male hash", { from: owner }); // 4

    await core.putInStud(4, amount, 1, { from: owner, value: query });

    await instance.mix(4, 1, "female offspring hash", { from: owner, value: amount }); // 5

    let genotype = await core.getGenotype.call(5); // At this point parents had 1 and 1 as genotype.
    assert.equal(genotype.toNumber(), 2);
  })

  // Maybe same as above tests but with a more direct approach
  it("should revert when mixing two offsprings from the same parents", async () => {
    await instance.mix(4, 1, "male offspring hash", { from: owner, value: amount }); // 6

    // Mixing the two horses from the same parents (5 and 6)
    try {
      await instance.mix(6, 5, "failed female hash", { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when mixing an offspring with a parent", async () => {
    // Mix 5 with 4, 5 being offspring of 4.
    try {
      await instance.mix(4, 5, "failed female hash", { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when mixing two horses with the same sex", async () => {
    await gop.createGOP(owner, "female hash", { from: owner }); // 7
    // 1 and 7 are two females and not related, if the second parameter isn't a female horse it'll throw.
    try {
      await instance.mix(1, 3, "failed male hash", { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when the second parameter isn't a female horse", async () => {
    try {
      await instance.mix(1, 4, "failed male hash", { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when mixing with ancestors", async () => {
    // Ancestors have a limit until grandparents, that would be two ancestors lines.
    // We'll go for Paternal grandparents
    // We'll use new horses for this.
    await gop.createGOP(owner, "male hash", { from: owner }); // 8
    await gop.createGOP(owner, "female hash", { from: owner }); // 9

    await core.putInStud(8, amount, 1, { from: owner, value: query });

    await instance.mix(8, 9, "male offspring hash", { from: owner, value: amount }); // 10

    await core.putInStud(10, amount, 1, { from: owner, value: query });

    await gop.createGOP(owner, "female hash", { from: owner }); // 11
    await instance.mix(10, 11, "male offspring hash", { from: owner, value: amount }); // 12

    await core.putInStud(12, amount, 1, { from: owner, value: query });

    await gop.createGOP(owner, "female hash", { from: owner }); // 13
    await instance.mix(10, 13, "male offspring hash", { from: owner, value: amount }); // 14

    // Trying to mate 12 with 9 should revert.
    try {
      await instance.mix(12, 9, "failed female hash", { from: owner, value: amount });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should revert when using ids of horses that don't exist", async () => {
    try {
      await instance.mix(9999999, 99999999, "failed female hash", { from: owner, value: amount });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should send the reserve amount to the owner of the male horse when creating an offspring", async () => {
    await gop.createGOP(acc[2], "female hash", { from: owner }); // 15

    let preBalance = web3.toWei(web3.eth.getBalance(owner));

    await instance.mix(4, 15, "male offspring hash", { from: acc[2], value: amount }); // 16

    let currBalance = web3.toWei(web3.eth.getBalance(owner));
    // We do this comparison here because 'assert' expects a number, so we just pass the boolean from this op.
    let comp = (preBalance < currBalance);
    assert(comp);
  })

  it("should select the correct bloodline based in parents", async () => {
    await gop.createGOP(owner, "female hash", { from: owner }); // 17
    await gop.createGOP(owner, "male hash", { from: owner }); // 18

    await core.putInStud(18, amount, 1, { from: owner, value: query });

    await instance.mix(18, 17, "female offspring hash", { from: owner, value: amount }); // 19

    let bloodline = await core.getBloodline.call(19); // Nakamoto - Nakamoto = Nakamoto
    assert.equal("N", web3.toUtf8(bloodline));

    for (let i = 20; i <= 325; i++) {
      if (i == 100) {
        await gop.closeBatch(1, { from: owner });
        await gop.openBatch(2, { from: owner });
      } else if (i == 299) {
        await gop.closeBatch(2, { from: owner });
        await gop.openBatch(3, { from: owner });
      }

      // We're going to create 700 horses so we have a different genotype
      await gop.createGOP(owner, "random hash", { from: owner });
    }

    await core.putInStud(20, amount, 1000, { from: owner, value: query });

    await instance.mix(20, 321, "female offspring hash", { from: owner, value: amount });

    bloodline = await core.getBloodline.call(325);
    assert.equal(web3.toUtf8(bloodline), "S");
  })
})