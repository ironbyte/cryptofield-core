const Core = artifacts.require("./Core");
const GOPCreator = artifacts.require("./GOPCreator");

contract("StudService", acc => {
  let core, queryPrice, gop;
  let owner = acc[1];
  let amount = web3.toWei(0.40, "ether");

  let seconds = { day3: 259200, day6: 518400 }

  before("setup instance", async () => {
    core = await Core.deployed();
    gop = await GOPCreator.deployed();

    await core.setGOPCreator(gop.address, { from: owner });

    await gop.openBatch(1, { from: owner });

    await gop.createGOP(owner, "genesis male hash", { from: owner }); // 0
    await gop.createGOP(owner, "female horse", { from: owner, value: amount }); // 1
    await gop.createGOP(owner, "male horse", { from: owner, value: amount }); // 2


    queryPrice = await core.getQueryPrice.call();
  })

  it("should put the horse in stud", async () => {
    await core.putInStud(2, amount, seconds.day3, { from: owner, value: queryPrice });
    let studInfo = await core.studInfo.call(2);

    assert.equal(studInfo[0], true);
  })

  it("should be able to remove horse from stud", async () => {
    // This can be used for verification but DOES prevent the horse to be placed in a stud
    // unless the time specified has already passed.
    await core.removeFromStud(2, { from: owner });
    let studInfo = await core.studInfo.call(2);

    await core.removeHorseOWN(2, { from: owner }); // Makes horse available for Stud again.

    assert.equal(studInfo[0], false);
  })

  it("should revert when not the owner tries to put a horse in stud", async () => {
    try {
      await core.putInStud(2, amount, seconds.day6, { from: acc[2], value: queryPrice });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should return valid data from stud", async () => {
    // Put the horse again in stud
    await core.putInStud(2, amount, seconds.day3, { from: owner, value: queryPrice });

    let studInfo = await core.studInfo.call(2);

    assert.equal(studInfo[0], true);
    assert.equal(studInfo[1], amount);

    // Remove from stud
    await core.removeFromStud(2, { from: owner });

    studInfo = await core.studInfo.call(2);

    assert.equal(studInfo[0], false);
    assert.equal(studInfo[1], 0);

    await core.removeHorseOWN(2, { from: owner });
  })

  it("should revert if we try to put a female horse into stud", async () => {
    try {
      await core.putInStud(1, amount, seconds.day6, { from: acc[2], value: queryPrice });
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })

  it("should use a default value if a different time is sent", async () => {
    // We'll use a random value for the duration since only three values are allowed at the moment.
    await core.putInStud(2, amount, 123456, { from: owner, value: queryPrice });

    let studInfo = await core.studInfo.call(2);

    assert.equal(studInfo[2].toNumber(), 259200); // Default to three days.
  })
})