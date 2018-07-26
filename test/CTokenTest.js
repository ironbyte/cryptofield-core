const CToken = artifacts.require("./CToken");

contract("CToken", acc => {
  let instance;
  let owner = acc[0];
  let secondBuyer = acc[1];
  let amount = new web3.BigNumber(web3.toWei(1, "finney"));

  beforeEach("setup instance", async () => {
    instance = await CToken.deployed();
  })

  it("should mint a new token with specified params", async () => {
    await instance.createHorse(owner, "some random hash", {value: amount});
    let tokenOwner = await instance.ownerOfToken.call(0);

    assert.equal(tokenOwner, owner);
  })

  it("should return the owned tokens of an address", async () => {
    let tokens = await instance.getOwnedTokens.call(owner);

    // This returns the token IDS in an array, not the amount of tokens.
    assert.equal(tokens.toString(), "0");
  })

  it("should be able to transfer a token", async () => {
    // 'owner' has token 0.
    await instance.transferTokenTo(owner, secondBuyer, 0);
    let newTokenOwner = await instance.ownerOfToken.call(0);

    assert.equal(secondBuyer, newTokenOwner);
  })

  it("should transfer a token when a sale is made for a given token", async () => {
    // From 'secondBuyer' to 'owner'
    await instance.tokenSold(secondBuyer, owner, 0, {from: secondBuyer});
    let newTokenOwner = await instance.ownerOfToken.call(0);

    assert.equal(owner, newTokenOwner);
  })
})
