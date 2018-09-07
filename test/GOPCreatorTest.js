const GOPCreator = artifacts.require("./GOPCreator");
const Core = artifacts.require("./Core");

contract("GOPCreator", acc => {
  let instance, core;
  let owner = acc[1];

  before("setup instance", async () => {
    instance = await GOPCreator.deployed();
    core = await Core.deployed();

    await core.setGOPCreator(instance.address, { from: owner });

    await instance.openBatch(1, { from: owner });

    await instance.createGOP(owner, "first hash"); // 0
  })

  it("should open a batch", async () => {
    await instance.createGOP(owner, "some hash"); // 1

    let remaining = await instance.horsesRemaining.call(1);

    assert.equal(remaining.toNumber(), 99);
  })

  it("should create correct horse based on open batch", async () => {
    await instance.closeBatch(1, { from: owner });
    await instance.openBatch(3, { from: owner });
    await instance.createGOP(owner, "some hash"); // 2

    let genotype = await core.getGenotype.call(2);
    let bloodline = await core.getBloodline.call(2);

    assert.equal(genotype.toNumber(), 3);
    assert.equal(web3.toUtf8(bloodline), "S");
  })
})