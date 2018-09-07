var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer, network, acc) {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "testnet") {
    deployer.deploy(Migrations);
  } else {
    deployer.deploy(Migrations, { from: acc[1] });
  }
};
