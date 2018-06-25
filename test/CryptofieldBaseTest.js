const CryptofieldBase = artifacts.require("./CryptofieldBase");

// TODO: Fix tests

contract("CryptofieldBaseContract", accounts => {
  let instance;
  let owner = accounts[0];
  let buyer = accounts[1];
  let bio = "Some short biography";
  let value = web3.toWei(1, "finney");

    // This array should be returned by the API server,
    // we're not using it in tests.
    let byteParams = [
      "Sundance Dancer",
      "Red",
      "Stallion",
      "Fast",
      "Canada",
      "Male",
      "2",
      "pedigree"
    ];

    for(let i = 0; i < byteParams.length; i++) {
      byteParams[i] = web3.fromAscii(byteParams[i], 32)
    }

  beforeEach("setup contract instance", async () => {
    instance = await CryptofieldBase.deployed();
  })

  it("should be able to buy a stallion", async () => {

    // We're not specifying 'value' nor 'gas' here.
    instance.buyStallion(buyer, bio, 15, byteParams, {from: buyer, value: value});

    let stallionsAvailable = await instance.getStallionsAvailable();
    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(stallionsAvailable, 1110);
    assert.equal(ownerOf.toString(), buyer);
  })

  it("should return the horses owned by an address", async () => {
    let horsesOwnedIds = [];

    // Just buy two horses
    instance.buyStallion(buyer, bio, 16, byteParams);
    instance.buyStallion(buyer, bio, 17, byteParams);

    let horsesOwned = await instance.getHorsesOwned(buyer);

    horsesOwned.map((id, index) => { horsesOwnedIds[index] = id.toString() })

    // User bought a horse in the previous test, the state remains between tests.
    assert.deepEqual(horsesOwnedIds, ["1"]);
  })

  it("should be able to transfer a horse", async () => {
    let secondBuyer = accounts[2];

    // Buy a horse with the main buyer account
    instance.buyStallion(buyer, bio, 15, byteParams);

    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(ownerOf, buyer)

    // Transfer
    instance.sendHorse(buyer, secondBuyer, 1, {from: buyer, value: value});

    let newOwnerOf = await instance.ownerOfHorse(1);

    assert.notStrictEqual(newOwnerOf, buyer);
    assert.equal(newOwnerOf, secondBuyer);
  })
})
