import { TestHelper } from "zos";

const Core = artifacts.require("./Core");
const GOPCreator = artifacts.require("./GOPCreator");
const HorseData = artifacts.require("HorseData");

contract("CryptofieldBaseContract", accounts => {
  let core, gop, hd, project;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let owner = accounts[1];
  let deployer = accounts[2];
  let amount = web3.toWei(0.40, "ether");

  before("setup instances", async () => {
    project = await TestHelper({ from: deployer })

    core = await project.createProxy(Core, { initArgs: [owner] });
    gop = await project.createProxy(GOPCreator, { initArgs: [core.address, owner] });
    hd = await project.createProxy(HorseData);

    await core.setGOPCreator(gop.address, { from: owner });
    await core.setHorseDataAddr(hd.address, { from: owner });

    await gop.openBatch(1, { from: owner });
  })


  it("should be able to buy a horse", async () => {
    await gop.createGOP(owner, hash, { from: owner }); // 0
    let horseHash = await core.getHorseData.call(0)

    assert.equal(horseHash[0], hash);
  })

  // it("should contain one of the default names for GOP", async () => {
  //   let horseName = await core.getHorseData.call(0);
  //   assert.include(defaults, horseName[4]);
  // })

  it("should create correct genotype based on number of sale", async () => {
    // If we get the first one, we should have genotype 1.
    let genotype = await core.getHorseData.call(0);
    assert.equal(genotype[5].toNumber(), 1);

    for (let i = 0; i <= 305; i++) {
      if (i === 100) {
        await gop.closeBatch(1, { from: owner });
        await gop.openBatch(2, { from: owner });
      } else if (i === 299) {
        await gop.closeBatch(2, { from: owner });
        await gop.openBatch(3, { from: owner });
      }

      await gop.createGOP(accounts[5], "random hash", { from: accounts[5], value: amount });
    }

    genotype = await core.getHorseData.call(100);
    assert.equal(genotype[5].toNumber(), 1);

    let genotype2 = await core.getHorseData.call(120);
    assert.equal(genotype2[5].toNumber(), 2);
  })

  it("should create the correct bloodline for a horse", async () => {
    // We're using horses from the above test.
    let bloodline = await core.getHorseData.call(88);
    assert.equal(web3.toUtf8(bloodline[6]), "N");

    bloodline = await core.getHorseData.call(150);
    assert.equal(web3.toUtf8(bloodline[6]), "N");

    bloodline = await core.getHorseData.call(302);
    assert.equal(web3.toUtf8(bloodline[6]), "S");
  })
})
