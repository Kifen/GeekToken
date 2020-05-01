const GeekToken = artifacts.require("GeekToken");
const initialSupply = 1000000000;

module.exports = function (deployer) {
  deployer.deploy(GeekToken, initialSupply);
};
