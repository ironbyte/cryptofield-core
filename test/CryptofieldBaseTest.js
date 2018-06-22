const CryptofieldBase = artifacts.require("./CryptofieldBase");

// TODO: Fix tests

contract("HorseContract", accounts => {
  let instance;

  beforeEach("setup contract instance", async () => {
    instance = await Horse.deployed();
  })

  it("should be able to buy a stallion", async () => {
    let buyer = accounts[1];

    instance.buyStallion(buyer, "some short bio", byteParams);

    let stallionsAvailable = await instance.getStallionsAvailable();

    assert.equal(stallionsAvailable, 1110);
  })

  it("should return the horses owned by an address", async () => {
    let buyer = accounts[1];
    let horsesOwnedIds = [];

    instance.buyStallion(buyer, "Some short biography", byteParams);
    let horsesOwned = await instance.getStallions(buyer);

    horsesOwned.map((id, index) => { horsesOwnedIds[index] = id.toString() })

    // User bought a horse in the previous test, the state remains between tests.
    assert.deepEqual(horsesOwnedIds, ["0", "1"]);
  })
})
