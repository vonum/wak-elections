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
  });

  it("Sets contract params properly", async () => {
    const wkndAddress = await this.votingContract.wknd();
    const votingStatus = await this.votingContract.votingStatus();

    expect(wkndAddress).to.eq(this.wkndContract.address);
    expect(votingStatus).to.eq(false);
  });
});
