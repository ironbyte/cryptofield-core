const Auctions = artifacts.require("./Auctions");

contract("Auctions", accounts => {
  let instance;
  let amount = web3.toWei(1, "ether");

  beforeEach("setup instance", async () => {
    instance = await Auctions.deployed();
  })

  /*
  Since we can't test the oraclize, we're going to try to recreate
  the function.
  */
  it("should create an auction", async () => {
    instance.createAuction(accounts[1], 1, { from: accounts[1], value: amount })
    let auctions = await instance.getAuctionsLength();

    // Auction has been created.
    assert.equal(auctions, 1);

    // Manually send the response to '__callback'.
    instance.__callback("1234", "0");

    let status = await instance.getAuctionStatus(0);

    assert.equal(status, false);
  })
})