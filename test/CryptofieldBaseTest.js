const Core = artifacts.require("./Core");

contract("CryptofieldBaseContract", accounts => {
  let core;
  let hash = "QmTsG4gGyRYXtBeTY7wqcyoksUp9QUpjzoYNdz8Y91GwoQ";
  let buyer = accounts[1];
  let defaults = [
    "Austin Riffle", "Jerri Curl", "Amoxi", "Chase Jackson", "Zeus", "Apollo"
  ];


  beforeEach("setup contract instance", async () => {
    core = await Core.deployed();
  })

  it("should be able to buy a horse", async () => {
    await core.createGOP(buyer, hash);
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

    for (let i = 1; i <= 305; i++) {
      // We're going to create 700 horses so we have a different genotype
      await core.createGOP(buyer, "random hash");
    }

    genotype = await core.getGenotype.call(100);
    assert.equal(genotype.toNumber(), 1);

    let genotype2 = await core.getGenotype.call(101);
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
