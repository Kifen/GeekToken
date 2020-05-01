const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");

let GeekToken = artifacts.require("./GeekToken.sol");

contract("GeekToken", (accounts) => {
  let tokenInstance;
  it("should initialize contract with correct values", async () => {
    const _name = "GeekToken";
    const _symbol = "GKT";
    const _decimals = 18;

    tokenInstance = await GeekToken.deployed();
    const symbol = await tokenInstance.symbol();
    const name = await tokenInstance.name();
    const decimals = await tokenInstance.decimals();

    assert.equal(decimals, _decimals, "has correct decimals");
    assert.equal(symbol, _symbol, "has correct symbol");
    assert.equal(name, _name, "has correct name");
  });

  it("should set the total supply upon deployment", async () => {
    tokenInstance = await GeekToken.deployed();
    const totalSupply = await tokenInstance.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      1000000000,
      "sets the total supply to 1000000000"
    );
  });

  it("should transfer token ownership", async () => {
    tokenInstance = await GeekToken.deployed();
    const success = await tokenInstance.transfer.call(accounts[1], 1000, {
      from: accounts[0],
    });

    const tx = await tokenInstance.transfer(accounts[1], 1000, {
      from: accounts[0],
    });
    const senderBalance = await tokenInstance.balanceOf(accounts[0]);
    const receiverBalance = await tokenInstance.balanceOf(accounts[1]);

    const log = tx.receipt.logs[0];
    assert.equal(tx.receipt.logs.length, 1, "triggers one event");
    assert.equal(
      log.args.from,
      accounts[0],
      "logs the account the tokens are transferred from."
    );

    assert.equal(
      log.args.to,
      accounts[1],
      "logs the account the tokens are transferred to."
    );

    assert.equal(log.args.tokens.toNumber(), 1000, "logs the transfer amount.");
    assert.equal(log.event, "Transfer", "should be a Transfer event.");
    assert.equal(success, true, "it returns true.");

    assert.equal(
      senderBalance.toNumber(),
      1000000000 - 1000,
      "deducts the amount from the sending account."
    );

    assert.equal(
      receiverBalance.toNumber(),
      1000,
      "adds the amount to the receiving account."
    );
  });

  it("should revert transfer if sender has insufficient tokens", async () => {
    tokenInstance = await GeekToken.deployed();
    try {
      await tokenInstance.transfer(accounts[1], 10000000000, {
        from: accounts[0],
      });
    } catch (e) {
      assert(
        e.message.indexOf("revert") >= 0,
        "error message must contain revert."
      );

      assert(e.message.includes("Insufficient tokens"));
    }
  });
});
