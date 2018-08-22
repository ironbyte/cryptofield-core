const Core = artifacts.require("./Core");

contract("Token", acc => {
  let instance;
  let owner = acc[1];
  let secondBuyer = acc[2];
  let amount = new web3.BigNumber(web3.toWei(1, "finney"));

  beforeEach("setup instance", async () => {
    instance = await Core.deployed();
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

  it("should transfer ownershp of the contract", async () => {
    let newOwner = acc[5];

    let op = await instance.transferOwnership(newOwner, {from: owner});
    let loggedOwner = op.logs[0].args.newOwner;

    assert.equal(loggedOwner, newOwner);
  })

  it("should use the given name if one is passed", async () => {
    await instance.createHorse(owner, "some hash");
    await instance.setName("Spike", 1, {from: owner});
    let name = await instance.getHorseName.call(1);
    
    assert.equal(name, "Spike");
  })

  it("should generate a random name if no name is given", async () => {
    await instance.createHorse(owner, "some hash");
    // We're just going to pass an empty string from the front-end.
    await instance.setName("", 2, {from: owner})
    let name = await instance.getHorseName.call(2);

    assert.notEqual(name, "");
  })
})
