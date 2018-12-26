import { TestHelper } from "zos";

const Core = artifacts.require("./Core");
const Breeding = artifacts.require("./Breeding");
const GOPCreator = artifacts.require("./GOPCreator");
const HorseData = artifacts.require("HorseData");

// TODO: TESTS FOR BASE VALUE, CHECK IF IT SHOULD STAY IN THIS FILE

contract("Token", acc => {
  let instance, breed, gop, hd, project;
  let owner = acc[1];
  let secondBuyer = acc[2];
  let deployer = acc[3];
  let amount = web3.toWei(0.40, "ether");

  before("setup instances", async () => {
    project = await TestHelper({ from: deployer })

    instance = await project.createProxy(Core, { initArgs: [owner] });
    breed = await project.createProxy(Breeding, { initArgs: [instance.address, owner] });
    gop = await project.createProxy(GOPCreator, { initArgs: [instance.address, owner] });
    hd = await project.createProxy(HorseData);

    await instance.setGOPCreator(gop.address, { from: owner });
    await instance.setBreedingAddr(breed.address, { from: owner })
    await instance.setHorseDataAddr(hd.address, { from: owner });

    await gop.openBatch(1, { from: owner });
  })

  it("should mint a new token with specified params", async () => {
    await gop.createGOP(owner, "male hash", { from: owner, value: amount }); // 0
    let tokenOwner = await instance.ownerOf(0);

    assert.equal(tokenOwner, owner);
  })

  it("should be able to transfer a token", async () => {
    // 'owner' has token 0.
    await instance.safeTransferFrom(owner, secondBuyer, 0, { from: owner });
    let newTokenOwner = await instance.ownerOf(0);

    assert.equal(secondBuyer, newTokenOwner);
  })

  it("should transfer ownershp of the contract", async () => {
    let newOwner = acc[5];

    let op = await instance.transferOwnership(newOwner, { from: owner });
    let loggedOwner = op.logs[0].args.newOwner;

    assert.equal(loggedOwner, newOwner);
  })

  it("should select the correct range of base value depending on the gen", async () => {
    await gop.createGOP(owner, "some hash", { from: owner, value: amount }); // 1

    let baseValue = await instance.getBaseValue.call(1)
    assert.isAtLeast(baseValue.toNumber(), 95) && assert.isAtMost(baseValue.toNumber(), 99);

    await gop.closeBatch(1, { from: owner });
    await gop.openBatch(2, { from: owner });

    await gop.createGOP(owner, "some hash", { from: owner, value: amount }); // 2

    baseValue = await instance.getBaseValue.call(2);

    assert.isAtLeast(baseValue.toNumber(), 80) && assert.isAtMost(baseValue.toNumber(), 89);
  })
})
