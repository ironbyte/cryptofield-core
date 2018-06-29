const CryptofieldBase = artifacts.require("./CryptofieldBase");

// TODO: Fix tests

contract("CryptofieldBaseContract", accounts => {
  let instance;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let owner = accounts[0];
  let buyer = accounts[1];
  let value = web3.toWei(1, "finney");


  beforeEach("setup contract instance", async () => {
    instance = await CryptofieldBase.deployed();
  })

  it("should be able to buy a stallion", async () => {
    instance.buyG1P(buyer, hash, {from: buyer, value: value});

    let stallionsAvailable = await instance.getStallionsAvailable();
    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(stallionsAvailable, 1110);
    assert.equal(ownerOf.toString(), buyer);
  })

  it("should return the horses owned by an address", async () => {
    let horsesOwnedIds = [];

    // Just buy two horses
    instance.buyG1P(buyer, hash, {from: buyer, value: value});
    instance.buyG1P(buyer, hash, {from: buyer, value: value});

    let horsesOwned = await instance.getHorsesOwned(buyer);

    horsesOwned.map((id, index) => { horsesOwnedIds[index] = id.toString() })

    assert.deepEqual(horsesOwnedIds, ["1", "2", "3"]);
  })

  it("should be able to transfer a horse", async () => {
    let secondBuyer = accounts[2];

    // Buy a horse with the main buyer account
    instance.buyG1P(buyer, hash);

    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(ownerOf, buyer)

    // Transfer
    instance.sendHorse(buyer, secondBuyer, 1, {from: buyer, value: value});

    let newOwnerOf = await instance.ownerOfHorse(1);

    assert.notStrictEqual(newOwnerOf, buyer);
    assert.equal(newOwnerOf, secondBuyer);
  })
})
