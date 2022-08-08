require("dotenv").config();

const express = require("express");
var cors = require("cors")
const asyncHandler = require("express-async-handler");
const axios = require("axios");

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const CONTRACT_ADDRESS = process.env.VOTING_CONTRACT_ADDRESS;
const web3 = createAlchemyWeb3(process.env.API_URL);

const contract = require("./build/contracts/Voting.json");
const votingContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS);

const app = express();
app.use(cors());
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
