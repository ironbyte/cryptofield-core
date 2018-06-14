/*const CToken = artifacts.require("./CToken");

import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";

contract("CryptofieldToken", acc => {
  it("Should make first account the owner", async () => {
    let instance = await CToken.deployed();
    let owner = await instance.owner();

    assert.equal(owner, acc[0]);
  })

  describe("mint", () => {
    it("creates a token with specified outer and inner colors", async () => {
      let instance = await CToken.deployed();
      let owner = await instance.owner();
      let token = await instance.mint("#ff00dd", "#ddddff");
      let tokens = await instance.tokenOfOwnerByIndex(owner, 0);
      let gradients = await instance.getGradientData(tokens);

      assert.deepEqual(gradients, ["#ff00dd", "#ddddff"]);
    })

    it("allows new tokens to be minted only by the owner", async () => {
      let instance = await CToken.deployed();
      let other = acc[1];

      await instance.transferOwnership(other);
      await assertRevert(instance.mint("#ff00dd", "#ddddff"));
    })
  })
})
*/
