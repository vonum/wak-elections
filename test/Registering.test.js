const { expect } = require("chai");
const { accounts, contract, web3 } = require("@openzeppelin/test-environment");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const WKND = contract.fromArtifact("WKND");
const Voting = contract.fromArtifact("Voting");

describe("VotingContract", () => {
  const [ owner, user ] = accounts;
  const initialSupply = new BN("1000");
  const candidates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  beforeEach(async () => {
    this.wkndContract = await WKND.new(initialSupply, {from: owner});
    this.votingContract = await Voting.new(this.wkndContract.address, {from: owner});

    await this.wkndContract.contract.methods
      .transfer(this.votingContract.address, initialSupply)
      .send({from: owner, gas: 500000});
  });

  describe("Registering", () => {
    it("Succeeds when user tries to register the first time", async () => {
      const tx = await this.votingContract.contract.methods
        .register()
        .send({from: owner, gas: 5000000});

      expect(tx.status).to.eq(true);
    });

    it("Transfers one WKND token to user", async () => {
      const userBalance = await this.wkndContract.balanceOf(owner);
      const contractBalance = await this.wkndContract.balanceOf(
        this.votingContract.address
      );

      await this.votingContract.contract.methods
        .register()
        .send({from: owner, gas: 5000000});

      const newUserBalance = await this.wkndContract.balanceOf(owner);
      const newContractBalance = await this.wkndContract.balanceOf(
        this.votingContract.address
      );

      expect(userBalance.toNumber()).to.eq(0);
      expect(contractBalance.toNumber()).to.eq(1000);

      expect(newUserBalance.toNumber()).to.eq(1);
      expect(newContractBalance.toNumber()).to.eq(999);
    });

    it("Emits an event when user registers", async () => {
      const tx = await this.votingContract.contract.methods
        .register()
        .send({from: owner, gas: 500000});

      expectEvent(
        tx,
        "VoterRegistered",
        {voter: owner}
      );
    });

    it("Reverts when user is already registered", async () => {
      await this.votingContract.contract.methods
        .register()
        .send({from: owner, gas: 5000000});

      await expectRevert(
        this.votingContract.contract.methods
          .register()
          .send({from: owner, gas: 5000000}),
        "Already registered",
      );
    });
  });
});
