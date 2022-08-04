const { expect } = require("chai");
const { accounts, contract, web3 } = require("@openzeppelin/test-environment");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { notEmitted } = require("@openzeppelin/test-helpers").expectEvent;

const WKND = contract.fromArtifact("WKND");
const Voting = contract.fromArtifact("Voting");

const voteAndEmit = async (contract, sender, candidate) => {
  const tx = await contract.contract.methods
    .vote(candidate, 1)
    .send({from: sender, gas: 500000});

  const candidates = await this.votingContract.winningCandidates();
  const c = candidates.map(c => c.toNumber());
  console.log(`\n${c}`);

  expectEvent(
    tx,
    "NewChallanger",
    {candidate: candidate.toString()}
  );
}

const voteWithoutEmit = async (contract, sender, candidate) => {
  const tx = await contract.contract.methods
    .vote(candidate, 1)
    .send({from: sender, gas: 500000});

  const candidates = await this.votingContract.winningCandidates();
  const c = candidates.map(c => c.toNumber());
  console.log(`\n${c}`);

  notEmitted(tx, "NewChallanger");
}

const winningCandidates = async (contract, c1, c2, c3) => {
  const candidates = await this.votingContract.winningCandidates();
  expect(candidates[0].toNumber()).to.eq(c1);
  expect(candidates[1].toNumber()).to.eq(c2);
  expect(candidates[2].toNumber()).to.eq(c3);
}

describe("VotingContract", () => {
  const initialSupply = new BN("1000");
  const owner = accounts[0];

  beforeEach(async () => {
    this.wkndContract = await WKND.new(initialSupply, {from: owner});
    this.votingContract = await Voting.new(this.wkndContract.address, {from: owner});

    await this.wkndContract.contract.methods
      .transfer(this.votingContract.address, initialSupply)
      .send({from: owner, gas: 500000});

    for (const acc of accounts) {
      await this.votingContract.contract.methods
        .register()
        .send({from: acc, gas: 500000});

      await this.wkndContract.contract.methods
        .approve(this.votingContract.address, 1)
        .send({from: acc, gas: 500000});
    }
  });

  describe("Top Candidates", () => {
    it("Changes top candidates and emits event appropriately", async () => {
      /* 1 - 1
       * 2 - 0
       * 3 - 3
       * 4 - 1
       * 5 - 3
       * 6 - 0
       * 7 - 2
       * 8 - 0
       * 9 - 0
       * 10 - 0
       */
      await voteAndEmit(this.votingContract, accounts[0], 1)
      await winningCandidates(this.votingContract, 1, 0, 0);

      await voteAndEmit(this.votingContract, accounts[1], 3)
      await winningCandidates(this.votingContract, 1, 3, 0);
      await voteWithoutEmit(this.votingContract, accounts[2], 3)
      await winningCandidates(this.votingContract, 3, 1, 0);
      await voteWithoutEmit(this.votingContract, accounts[3], 3)
      await winningCandidates(this.votingContract, 3, 1, 0);

      await voteAndEmit(this.votingContract, accounts[4], 4)
      await winningCandidates(this.votingContract, 3, 1, 4);

      await voteWithoutEmit(this.votingContract, accounts[5], 5)
      await winningCandidates(this.votingContract, 3, 1, 4);
      await voteAndEmit(this.votingContract, accounts[6], 5)
      await winningCandidates(this.votingContract, 3, 5, 1);
      await voteWithoutEmit(this.votingContract, accounts[7], 5)
      await winningCandidates(this.votingContract, 3, 5, 1);

      await voteWithoutEmit(this.votingContract, accounts[8], 7)
      await winningCandidates(this.votingContract, 3, 5, 1);
      await voteAndEmit(this.votingContract, accounts[9], 7)
      await winningCandidates(this.votingContract, 3, 5, 7);
    });
  });
});
