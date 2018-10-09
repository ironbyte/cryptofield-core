const GOPCreator = artifacts.require("./GOPCreator");
const Core = artifacts.require("./Core");
const HorseData = artifacts.require("HorseData");

contract("GOPCreator", acc => {
  let instance, core, hd;
  let owner = acc[1];
  let amount = web3.toWei(0.40, "ether");

  before("setup instance", async () => {
    instance = await GOPCreator.deployed();
    core = await Core.deployed();
    hd = await HorseData.deployed();

    await core.setGOPCreator(instance.address, { from: owner });
    await core.setHorseDataAddr(hd.address, { from: owner });

    await instance.openBatch(1, { from: owner });

    await instance.createGOP(owner, "first hash", { value: amount }); // 0
  })

  it("should open a batch", async () => {
    await instance.createGOP(owner, "some hash", { value: amount }); // 1

    let remaining = await instance.horsesRemaining.call(1);

    assert.equal(remaining.toNumber(), 999);
  })

  it("should create correct horse based on open batch", async () => {
    await instance.closeBatch(1, { from: owner });
    await instance.openBatch(3, { from: owner });
    await instance.createGOP(owner, "some hash", { value: amount }); // 2

    let genotype = await core.getHorseData.call(2);
    let bloodline = await core.getHorseData.call(2);

    assert.equal(genotype[6].toNumber(), 3);
    assert.equal(web3.toUtf8(bloodline[7]), "S");
  })

  it("should revert and not modify state", async () => {
    try {
      await instance.createGOP(owner, "some hash"); // 3
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }

    let genotype = await core.getHorseData.call(3);
    assert.equal(genotype[6].toNumber(), 0);
  })

  it("should close the batch once the number of horses available is 500", async () => {
    await instance.closeBatch(3, { from: owner });
    await instance.openBatch(1, { from: owner });

    for (let i = 2; i <= 500; i++) {
      await instance.createGOP(owner, "some hash", { value: amount });
    }

    try {
      await instance.createGOP(owner, "some hash", { value: amount }); // 3
      assert.fail("Expected revert not received");
    } catch (err) {
      let revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }

    let rem = await instance.horsesRemaining.call(1);
    assert.equal(rem.toNumber(), 500);
  })

  it("should allow to create more horses if the batch is open manually after reaching 500 horses", async () => {
    await instance.openBatch(1, { from: owner });
    await instance.createGOP(owner, "some hash", { value: amount });

    let rem = await instance.horsesRemaining.call(1);
    assert.equal(rem.toNumber(), 499);
  })

  it("should transfer the paid amount when a batch from 1 to 4 is open", async () => {
    let balance = await web3.eth.getBalance(owner);

    // Batch open <1>
    await instance.createGOP(acc[2], "some hash", { from: acc[2], value: amount });

    let newBalance = await web3.eth.getBalance(owner);

    let res = (newBalance > balance);

    assert(res);
  })

  it("should create an auction", async () => {
    await instance.closeBatch(1, { from: owner });
    await instance.openBatch(5, { from: owner });

    // When we're creating an auction, the first parameter doesn't matter.
    await instance.createGOP(owner, "some hash", { from: owner, value: amount }); // Auction 1

    let auction = await instance.auctionInformation.call(1);
    assert.equal(auction[2].toNumber(), 5);
    assert.equal(auction[3].toNumber(), 0);
    assert.equal(auction[6], true);
  })

  it("should claim the prize depending on user", async () => {
    // We're going to record 3 bids from different people.
    let val1 = web3.toWei(15, "ether");
    let val2 = web3.toWei(14, "ether");

    await instance.bid(1, { from: acc[4], value: val2 });
    await instance.bid(1, { from: acc[3], value: val1 });

    await instance.closeAuction(1, { from: owner });

    let prevBalance = web3.eth.getBalance(acc[4]);
    await instance.claim(1, { from: acc[4] }); // Should get their eth back
    let newBalance = web3.eth.getBalance(acc[4]);

    let comparison = prevBalance < newBalance;
    assert(comparison);

    // Token for maxBidder.
    await instance.claim(1, { from: acc[3] });
    // New horse is number 504
    let ownerOf = await core.ownerOf(504);
    assert.equal(ownerOf, acc[3]);
  })

  it("should add the user to a list of auctions they've participated", async () => {
    let auctionsUser1 = await instance.getAuctionsFor.call(owner);
    let auctionsUser2 = await instance.getAuctionsFor.call(acc[3]);

    // This is how an array of arrays as a String is represented.
    // 1st equals to [[1], []]
    // 2nd equals to [[], [1]]
    assert.deepEqual(auctionsUser1.toString(), "1,");
    assert.deepEqual(auctionsUser2.toString(), ",1");
  })
})