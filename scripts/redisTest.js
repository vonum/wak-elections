require("dotenv").config();

const SecureStore = require('secure-store-redis').default;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const REDIS_LOCAL_URL = process.env.REDIS_LOCAL_URL;
const REDIS_KEY = process.env.REDIS_KEY;
const REDIS_STORE = process.env.REDIS_STORE;

const CONTRACT_ADDRESS = process.env.VOTING_CONTRACT_ADDRESS;
const web3 = createAlchemyWeb3(process.env.API_URL);

const admin = web3.eth.accounts.privateKeyToAccount('0x' + process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);
web3.eth.defaultAccount = admin.address;

const contract = require("../build/contracts/Voting.json");
const votingContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS);

(async () => {
  redisClient = new SecureStore(
    REDIS_STORE,
    REDIS_KEY,
    {redis: {url: REDIS_LOCAL_URL}}
  );
  await redisClient.init();

  const votes = await redisClient.get("votes");

  for (vote of votes) {
    try {
      console.log("Casting vote");
      console.log(vote);
      await votingContract.methods
        .vote(vote.voter, vote.candidate, vote.value)
        .send({from: admin.address, gas: 500000});

      console.log("Successfully voted");
    } catch (e) {
      console.log("Failed to cast vote");
    }
  }
})();
