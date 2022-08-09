require("dotenv").config();

const express = require("express");
var cors = require("cors")
const asyncHandler = require("express-async-handler");
const axios = require("axios");

const SecureStore = require('secure-store-redis').default;
const redis = require("redis");

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const CONTRACT_ADDRESS = process.env.VOTING_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const web3 = createAlchemyWeb3(process.env.API_URL);

const REDIS_LOCAL_URL = process.env.REDIS_LOCAL_URL;
const REDIS_KEY = process.env.REDIS_KEY;
const REDIS_STORE = process.env.REDIS_STORE;

const contract = require("./build/contracts/Voting.json");
const votingContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS);

const admin = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY);
web3.eth.accounts.wallet.add(admin);
web3.eth.defaultAccount = admin.address;

let redisClient;

(async () => {
  redisClient = new SecureStore(
    REDIS_STORE,
    REDIS_KEY,
    {redis: {url: REDIS_URL}}
  );
  await redisClient.init();
})();

const app = express();
app.use(cors());
app.use(express.json())
const port = 3000;

const fetchCandidates = async () => {
  const data = await axios.get("https://wakanda-task.3327.io/list");
  return data.data.candidates;
}

app.get("/candidates", asyncHandler(async (req, res, next) => {
  const candidates = await fetchCandidates();
  const data = await votingContract.methods.candidateVotes().call();
  candidates.forEach((c, id) => {
    c.votes = parseInt(data[id]);
  });
  res.send(candidates);
}));

app.post("/register", asyncHandler(async (req, res, next) => {
  const voter = web3.utils.toChecksumAddress(req.body.voter);
  console.log(voter);

  const success = await votingContract.methods
    .register(voter)
    .send({from: admin.address, gas: 5000000});

  res.send(200);
}));

app.post("/vote", asyncHandler(async (req, res, next) => {
  const voter = req.body.voter;
  const candidate = req.body.candidate;
  const value = req.body.value;

  console.log("Voting:")
  console.log(`${voter} - ${candidate} - ${value}`)

  try {
    // throw "Error";
    const success = await votingContract.methods
      .vote(voter, candidate, value)
      .send({from: admin.address, gas: 5000000});
  } catch (e) {
    console.log("Voting transaction failed")
    let votes = await redisClient.get("votes");
    if (!votes) {
      votes = [];
    }
    votes.push({voter, candidate, value});
    redisClient.save("votes", votes);
    console.log("Saved vote in redis");
  }

  res.send(200);
}));

app.get("/winning_candidates", asyncHandler(async (req, res, next) => {
  const data = await votingContract.methods.winningCandidates().call();
  const candidates = await fetchCandidates();

  const winningCandidates = data.map(id => {
    return id ? candidates[parseInt(id) - 1] : null;
  });

  res.send(winningCandidates);
}));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});
