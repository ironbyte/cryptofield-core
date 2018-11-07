const Races = artifacts.require("./Races");

contract("Races", acc => {
  let instance;
  let owner = acc[1];

  before("setup instance", async () => {
    instance = await Races.deployed();
  })

  it("should create correct stats for the horses after a race", async () => {
    await instance.putDataForHorses(1, 30, [2, 3, 4], [20, 15, 10], [1, 2], [3, 4]);

    let winnerData = await instance.getRaceProfile.call(1);

    assert.equal(winnerData.toString(), "1,1,0,30,1,0")

    let horseData = await instance.getRaceProfile.call(2);
    assert.equal(horseData.toString(), "0,1,0,20,1,0")

    let paidHorse = await instance.getRaceProfile.call(4)
    assert.equal(paidHorse.toString(), "0,1,0,10,0,1")
  })
})