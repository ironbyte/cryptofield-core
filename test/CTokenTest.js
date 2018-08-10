const Auctions = artifacts.require("./Auctions");

contract("CToken", acc => {
  let instance;
  let owner = acc[1];
  let secondBuyer = acc[2];
  let amount = new web3.BigNumber(web3.toWei(1, "finney"));

  beforeEach("setup instance", async () => {
    instance = await Auctions.deployed();
  })

  it("should mint a new token with specified params", async () => {
    await instance.createHorse(owner, "some random hash", {value: amount});
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

  it("should transfer a token when a sale is made for a given token", async () => {
    // From 'secondBuyer' to 'owner'
    await instance.tokenSold(secondBuyer, owner, 0, {from: secondBuyer});
    let newTokenOwner = await instance.ownerOf(0);

    assert.equal(owner, newTokenOwner);
  })

  it("should transfer ownershp of the contract", async () => {
    let newOwner = acc[5];

    let op = await instance.transferOwnership(newOwner, {from: owner});
    let loggedOwner = op.logs[0].args.newOwner;

    assert.equal(loggedOwner, newOwner);
  })
})
