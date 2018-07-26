const Auctions = artifacts.require("./Auctions");
const CToken = artifacts.require("./CToken");

contract("Auctions", acc => {
  let instance;
  let tokenInstance;
  let buyer = acc[1];
  let amount = new web3.BigNumber(web3.toWei(1, "ether"));

  beforeEach("setup instance", async () => {
    instance = await Auctions.deployed();

    // We need this instance to mint a token.
    tokenInstance = await CToken.deployed();
  })

  /*
  Since we can't test the oraclize, we're going to try to recreate
  the function.
  */
  it("should create an auction", async () => {
    await tokenInstance.createHorse(buyer, "some hash");
    await instance.createAuction(0, 0, {from: buyer, value: amount});

    let auctions = await instance.getAuctionsLength.call();
    assert.equal(auctions.toString(), "1");

    let status = await instance.getAuctionStatus.call(0);
    assert.equal(status, true);
  })

  it("should record a new bid for an address", async () => {
    await tokenInstance.createHorse(buyer, "other hash");
    
    let res = await instance.createAuction(1, 1, {from: buyer, value: amount});
    let auctionId = res.logs[0].args._auctionId.toNumber();

    // Auction should be open for a while, we're not calling the __callback function anyway.
    await instance.bid(auctionId, {from: buyer, value: new web3.BigNumber(web3.toWei(0.025, "ether"))});

    // No one has bidded yet so the user should be the max bidder.
    let maxBidder = await instance.getMaxBidder.call(auctionId);
    assert.equal(maxBidder[0], buyer);

    // Record another bid for a higher amount
    await instance.bid(auctionId, {from: acc[3], value: new web3.BigNumber(web3.toWei(0.030, "ether"))});

    let newMaxBidder = await instance.getMaxBidder.call(auctionId);
    assert.equal(newMaxBidder[0], acc[3]);

    // amount of bidders should be two (2)
    let bidders = await instance.amountOfBidders.call(auctionId);
    assert.equal(bidders.toString(), "2");
  })

  it("should revert if the new bid amount is lower than the maxBid", async () => {
    await tokenInstance.createHorse(buyer, "third hash");

    let res = await instance.createAuction(1, 2, {from: buyer, value: amount});
    let auctionId = res.logs[0].args._auctionId.toNumber();

    // Record a new bid.
    await instance.bid(auctionId, {from: acc[2], value: web3.toWei(1, "finney")});

    // OpenZeppelin implementation.
    try {
      await instance.bid(auctionId, {from: acc[3], value: web3.toWei(0.5, "finney")});
      assert.fail("Expected revert not received");
    } catch(err) {
      const revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })
})