const GeekToken = artifacts.require("./GeekToken.sol");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("GeekToken", (accounts) => {
  let geekToken;
  const initialSupply = 1000000000;

  beforeEach(async () => {
    geekToken = await GeekToken.new(initialSupply, { from: accounts[0] });
  });

  it("should initialize contract with correct values", async () => {
    const _name = "GeekToken";
    const _symbol = "GKT";
    const _decimals = 18;

    const symbol = await geekToken.symbol();
    const name = await geekToken.name();
    const decimals = await geekToken.decimals();

    assert.equal(decimals, _decimals, "has correct decimals");
    assert.equal(symbol, _symbol, "has correct symbol");
    assert.equal(name, _name, "has correct name");
  });

  it("should set the total supply upon deployment", async () => {
    const totalSupply = await geekToken.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      initialSupply,
      "sets the total supply to 1000000000"
    );
  });

  it("should transfer token", async () => {
    const transferAmount = 10000;
    const tx = await geekToken.transfer(accounts[1], transferAmount, {
      from: accounts[0],
    });
    const senderBalance = await geekToken.balanceOf(accounts[0]);
    const receiverBalance = await geekToken.balanceOf(accounts[1]);

    //const log = tx.receipt.logs[0];

    // there should be an 'Transfer' event
    truffleAssert.eventEmitted(tx, "Transfer", (ev) => {
      return (
        ev.tokens.toNumber() === transferAmount &&
        ev.from === accounts[0] &&
        ev.to === accounts[1]
      );
    });

    // there should be no 'Approval' event
    truffleAssert.eventNotEmitted(tx, "Approval");

    assert.equal(
      senderBalance.toNumber(),
      initialSupply - transferAmount,
      "deducts the amount from the sending account."
    );

    assert.equal(
      receiverBalance.toNumber(),
      transferAmount,
      "adds the amount to the receiving account."
    );
  });

  it("should not be able to transfer more than available tokens", async () => {
    await truffleAssert.reverts(
      geekToken.transfer(accounts[1], 10000000000, { from: accounts[0] }),
      "Insufficient tokens!"
    );
  });

  it("should approve spending account", async () => {
    const amount = 1000;
    const tx = await geekToken.approve(accounts[1], amount, {
      from: accounts[0],
    });

    const allowance = await geekToken.allowance(accounts[0], accounts[1]);

    assert.equal(
      allowance,
      amount,
      "stores the allowance for delegated transfer."
    );

    // there should be no 'Approval' event
    truffleAssert.eventEmitted(tx, "Approval", (ev) => {
      return (
        ev.tokens.toNumber() === amount &&
        ev.tokenOwner === accounts[0] &&
        ev.spender === accounts[1]
      );
    });

    // there should be no 'Transfer' event
    truffleAssert.eventNotEmitted(tx, "Transfer");
  });

  it("should successfully 'transferFrom' accounts", async () => {
    const fromAccount = accounts[1];
    const toAccount = accounts[2];
    const spendingAccount = accounts[3];

    // Transfer some tokens to fromAccount
    const transferTx = await geekToken.transfer(fromAccount, 1000, {
      from: accounts[0],
    });

    // Approve spendingAccount to spend 100 tokens from fromAccount
    const apprpvalTx = await geekToken.approve(spendingAccount, 100, {
      from: fromAccount,
    });

    const transferFromTx = await geekToken.transferFrom(
      fromAccount,
      toAccount,
      50,
      {
        from: spendingAccount,
      }
    );

    const balanceFromAccount = await geekToken.balanceOf(fromAccount);
    const balanceToAccount = await geekToken.balanceOf(toAccount);

    assert.equal(balanceFromAccount, 950);
    assert.equal(balanceToAccount, 50);

    truffleAssert.eventEmitted(transferTx, "Transfer", (ev) => {
      return (
        ev.tokens.toNumber() === 1000 &&
        ev.from === accounts[0] &&
        ev.to === accounts[1]
      );
    });

    truffleAssert.eventEmitted(apprpvalTx, "Approval", (ev) => {
      return (
        ev.tokens.toNumber() === 100 &&
        ev.tokenOwner === fromAccount &&
        ev.spender === spendingAccount
      );
    });

    truffleAssert.eventEmitted(transferFromTx, "Transfer", (ev) => {
      return (
        ev.tokens.toNumber() === 50 &&
        ev.from === fromAccount &&
        ev.to === toAccount
      );
    });
  });

  it("should fail if amount transferred is greater than approved amount", async () => {
    const fromAccount = accounts[1];
    const toAccount = accounts[2];
    const spendingAccount = accounts[3];

    // Transfer some tokens to fromAccount
    await geekToken.transfer(fromAccount, 1000, {
      from: accounts[0],
    });

    // Approve spendingAccount to spend 100 tokens from fromAccount
    await geekToken.approve(spendingAccount, 100, {
      from: fromAccount,
    });

    await truffleAssert.reverts(
      geekToken.transferFrom(fromAccount, toAccount, 200, {
        from: spendingAccount,
      }),
      "Exceeded approved amount!"
    );

    await truffleAssert.reverts(
      geekToken.transferFrom(fromAccount, toAccount, 2000, {
        from: spendingAccount,
      }),
      "Insufficient tokens!"
    );
  });
});
