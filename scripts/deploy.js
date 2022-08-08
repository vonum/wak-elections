require("dotenv").config();

const {TIMEFRAME} = process.env;

async function main() {
  const initialSupply = 100000000;
  const [deployer] = await ethers.getSigners();

  const wkndContractFactory = await ethers.getContractFactory("./contracts/WKND.sol:WKND");
  const wkndContract = await wkndContractFactory.deploy(initialSupply);
  await wkndContract.deployed();
  console.log("WKND contract deployed to address:", wkndContract.address);

  const votingContractFactory = await ethers.getContractFactory("./contracts/Voting.sol:Voting");
  const votingContract = await votingContractFactory.deploy(wkndContract.address);
  await votingContract.deployed();
  console.log("Voting contract deployed to address:", votingContract.address);

  console.log("Sending some funds to voting contract");
  await wkndContract.transfer(votingContract.address, 100);

  console.log("Start voting");
  await votingContract.setVotingStatus(true);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
