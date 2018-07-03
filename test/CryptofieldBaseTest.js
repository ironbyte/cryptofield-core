const CryptofieldBase = artifacts.require("./CryptofieldBase");

// import { assertRevert } from "zeppelin-solidity/test/helpers/assertRevert.js";

// TODO: Fix tests

contract("CryptofieldBaseContract", accounts => {
  let instance;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let owner = accounts[0];
  let buyer = accounts[1];
  let secondBuyer = accounts[2];
  let value = web3.toWei(1, "finney");


  beforeEach("setup contract instance", async () => {
    instance = await CryptofieldBase.deployed();
  })

  it("should be able to buy a stallion", async () => {
    instance.buyStallion(buyer, hash, {from: buyer, value: value});

    let stallionsAvailable = await instance.getHorsesAvailable();
    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(stallionsAvailable[0].toString(), "156");
    assert.equal(ownerOf.toString(), buyer);
  })

  it("should return the horses owned by an address", async () => {
    let horsesOwnedIds = [];

    // At this point 'buyer' has two horses.
    instance.buyStallion(buyer, hash, {from: buyer, value: value});

    let horsesOwned = await instance.getHorsesOwned(buyer);

    horsesOwned.map((id, index) => { horsesOwnedIds[index] = id.toString() })

    assert.deepEqual(horsesOwnedIds, ["1", "2"]);
  })

  it("should be able to transfer a horse", async () => {
    let ownerOf = await instance.ownerOfHorse(1);

    assert.equal(ownerOf, buyer)

    // Transfer
    instance.sendHorse(buyer, secondBuyer, 1, {from: buyer, value: value});

    let newOwnerOf = await instance.ownerOfHorse(1);

    assert.notStrictEqual(newOwnerOf, buyer);
    assert.equal(newOwnerOf, secondBuyer);
  })

  it("should add 1 to times sold when a given horse is sold", async () => {
    let ownerOf = await instance.ownerOfHorse(1);

    // Ensure the owner of the horse.
    assert.equal(ownerOf, secondBuyer);

    instance.horseSell(secondBuyer, buyer, 1, {from: secondBuyer, value: value});
    let timesSold = await instance.auctionInformation(1);

    assert.equal(timesSold[3].toString(), "1");
  })

  it("should revert when horseId is higher than the available horses", async () => {
    // OpenZeppelin implementation.
    try {
      await instance.auctionInformation(1234);
      assert.fail("Expected revert not received");
    } catch(err) {
      const revertFound = err.message.search("revert") >= 0;
      assert(revertFound, `Expected "revert", got ${err} instead`);
    }
  })
})
