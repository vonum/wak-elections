const { expect } = require("chai");
const { accounts, contract, web3 } = require("@openzeppelin/test-environment");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const WKND = contract.fromArtifact("WKND");
const Voting = contract.fromArtifact("Voting");

describe("VotingContract", () => {
  const [ owner, user ] = accounts;
  const initialSupply = new BN("1000");

  beforeEach(async () => {
    this.wkndContract = await WKND.new(initialSupply, {from: owner});
    this.votingContract = await Voting.new(this.wkndContract.address, {from: owner});

    await this.wkndContract.contract.methods
      .transfer(this.votingContract.address, initialSupply)
      .send({from: owner, gas: 500000});
  });

  describe("Voting", () => {
    beforeEach(async () => {
      await this.votingContract.contract.methods
        .setVotingStatus(true)
        .send({from: owner, gas: 500000});

      await this.votingContract.contract.methods
        .register()
        .send({from: owner, gas: 500000});

      await this.wkndContract.contract.methods
        .approve(this.votingContract.address, 1)
        .send({from: owner, gas: 500000});
    });

    it("Succeeds when user is registered and hasn't voted yet", async () => {
      const tx = await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      expect(tx.status).to.eq(true);
    });

    it("Reverts when user is not registered", async () => {
      await expectRevert(
        this.votingContract.contract.methods
          .vote(1, 1)
          .send({from: user, gas: 5000000}),
        "Voter not registered",
      );
    });

    it("Reverts when user has already voted", async () => {
      await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      await expectRevert(
        this.votingContract.contract.methods
          .vote(1, 1)
          .send({from: owner, gas: 5000000}),
        "Already voted",
      );
    });

    it("Reverts when user votes for an invalid candidate", async () => {
      await expectRevert(
        this.votingContract.contract.methods
          .vote(0, 1)
          .send({from: owner, gas: 5000000}),
        "Invalid candidate",
      );
    });

    it("Increases the number of votes for the candidate", async () => {
      const initialVotes = await this.votingContract.votes(1);

      await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      const votes = await this.votingContract.votes(1);

      expect(initialVotes.toNumber()).to.eq(0);
      expect(votes.toNumber()).to.eq(1);
    });

    it("Sets the user status to voted", async () => {
      await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      const voted = await this.votingContract.voted(owner);
      expect(voted).to.eq(true);
    });

    it("Emits an event when user votes", async () => {
      const tx = await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      expectEvent(
        tx,
        "Voted",
        {voter: owner, candidate: "1", value: "1"}
      );
    });

    it("Emits an event when the top 3 candidates change", async () => {
      const tx = await this.votingContract.contract.methods
        .vote(1, 1)
        .send({from: owner, gas: 500000});

      expectEvent(
        tx,
        "NewChallanger",
        {candidate: "1"}
      );
    });

    it("Reverts when voting is paused", async () => {
      await this.votingContract.contract.methods
        .setVotingStatus(false)
        .send({from: owner, gas: 500000});

      await expectRevert(
        this.votingContract.contract.methods
          .vote(0, 1)
          .send({from: owner, gas: 5000000}),
        "Voting paused",
      );
    });
  });
});
