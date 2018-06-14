const Horse = artifacts.require("./Horse");

contract("HorseContract", accounts => {
  let instance;
  let byteParams = [
    "Sundance Dancer",
    "Brown",
    "Stallion",
    "Some breed",
    "Some running style",
    "Some origin",
    "Sire",
    "Some rank",
    "Some pedigree",
    "Some parents",
    "Some grandparents",
    "some phenotypes",
    "Some genotypes",
    "None"
  ];

  beforeEach("setup contract instance", async () => {
    instance = await Horse.deployed();

    /*byteParams.map((element, index) => {
      byteParams[index] = web3.fromAscii(element);
    })*/
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
