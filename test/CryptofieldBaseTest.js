const Core = artifacts.require("./Core");
const GOPCreator = artifacts.require("./GOPCreator");

contract("CryptofieldBaseContract", accounts => {
  let core, gop;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let buyer = accounts[1];
  let amount = web3.toWei(0.25, "ether");
  let defaults = [
    "Austin Riffle", "Jerri Curl", "Amoxi", "Chase Jackson", "Zeus", "Apollo"
  ];


  before("setup contract instance", async () => {
    core = await Core.deployed();
    gop = await GOPCreator.deployed();

    await core.setGOPCreator(gop.address, { from: buyer });

    await gop.openBatch(1, { from: buyer });
  })

  it("should be able to buy a horse", async () => {
    await gop.createGOP(buyer, hash, { from: buyer }); // 0
    let horse = await core.getHorseHash.call(0)

    assert.equal(horse, hash);
  })

  it("should return the correct hash for a horse", async () => {
    let returnedHash = await core.getHorseHash.call(0);

    assert.equal(hash, returnedHash);
  })

  it("should contain one of the default names for GOP", async () => {
    let horseName = await core.getHorseName.call(0);
    assert.include(defaults, horseName);
  })

  it("should create correct genotype based on number of sale", async () => {
    // If we get the first one, we should have genotype 1.
    let genotype = await core.getGenotype.call(0);
    assert.equal(genotype.toNumber(), 1);

    for (let i = 0; i <= 305; i++) {
      if (i === 100) {
        await gop.closeBatch(1, { from: buyer });
        await gop.openBatch(2, { from: buyer });
      } else if (i === 299) {
        await gop.closeBatch(2, { from: buyer });
        await gop.openBatch(3, { from: buyer });
      }

      await gop.createGOP(accounts[5], "random hash", { from: accounts[5], value: amount });
    }

    genotype = await core.getGenotype.call(100);
    assert.equal(genotype.toNumber(), 1);

    let genotype2 = await core.getGenotype.call(120);
    assert.equal(genotype2.toNumber(), 2);
  })

  it("should create the correct bloodline for a horse", async () => {
    // We're using horses from the above test.
    let bloodline = await core.getBloodline.call(88);
    assert.equal("N", web3.toUtf8(bloodline));

    bloodline = await core.getBloodline.call(150);
    assert.equal("N", web3.toUtf8(bloodline));

    bloodline = await core.getBloodline.call(302);
    assert.equal("S", web3.toUtf8(bloodline));
  })
})
