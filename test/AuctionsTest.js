const Auctions = artifacts.require("./Auctions");
const CToken = artifacts.require("./CToken");

contract("Auctions", acc => {
  let instance;
  let buyer = acc[1];
  let amount = new web3.BigNumber(web3.toWei(1, "finney"));
  let oraclizeAddr = "0xf0Bd23c643B420e399645fe54128A2E27915BdB9";

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
    await instance.createAuction(20, 0, {from: buyer, value: amount});

    let auctions = await instance.getAuctionsLength.call();
    assert.equal(auctions.toString(), "1");

    let status = await instance.getAuctionStatus.call(0);
    assert.equal(status, true);
  })

  // it("should close the given auction after calling __callback", async () => {
  //   await instance.createAuction(20, 0, {from: buyer, value: amount});
  //   let status = await instance.getAuctionStatus.call(0);

  //   assert.equal(status, true);

  //   await instance.__callback("12", "0", {from: oraclizeAddr});

  //   status = await instance.getAuctionStatus.call(0);

  //   assert.equal(status, false);
  // })
})