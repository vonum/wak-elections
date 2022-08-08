import { useState, useEffect } from 'react';
import './App.css';

const wkndAbi = require("./assets/contracts/WKND.json");
const votingAbi = require("./assets/contracts/Voting.json");

const Web3 = require("web3");
const axios = require("axios");


const setupWeb3 = async (setWeb3, setAccount, setBalance, setContracts) => {
  if (window.ethereum) {
    await window.ethereum.request({method: 'eth_requestAccounts'});
    window.web3 = new Web3(window.ethereum);
    setWeb3(window.web3);

    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);
    console.log("A", accounts);

    // const b = await window.web3.eth.getBalance(accounts[0]);
    // console.log(b);

    const wknd = new window.web3.eth.Contract(
      wkndAbi.abi,
      process.env.REACT_APP_WKND_CONTRACT_ADDRESS
    );
    const voting = new window.web3.eth.Contract(
      votingAbi.abi,
      process.env.REACT_APP_VOTING_CONTRACT_ADDRESS
    );

    setContracts({wknd, voting});

    const balance = await wknd.methods.balanceOf(accounts[0]).call();
    setBalance(balance);
    console.log(balance);

    return true;
  }

  return false;
}

const register = async (contract, account) => {
  try {
    console.log("Sending register tx");
    const success = await contract.methods.register().send({from: account});
    console.log(success);
  } catch (e) {
    console.log(e);
  }
}

const vote = async (contracts, account, id) => {
  try {
    console.log("Sending approval tx");
    const r1 = await contracts.wknd.methods
      .approve(process.env.REACT_APP_VOTING_CONTRACT_ADDRESS, 1)
      .send({from: account});
    console.log(r1);

    console.log("Sending vote tx");
    const r2 = await contracts.voting.methods
      .vote(id + 1, 1)
      .send({from: account});
    console.log(r2);
  } catch (e) {
    console.log(e);
  }
}

const getCandidates = async (setCandidates) => {
  const data = await axios.get(`${process.env.REACT_APP_APP_URL}/candidates`);
  console.log(data.data);
  setCandidates(data.data);
}

const getTopCandidates = async (contract, candidates, setTopCandidates) => {
  const data = await contract.methods.winningCandidates().call();
  const topCandidates = [];
  data.forEach(c => {
    c = parseInt(c);
    if (c) {
      topCandidates.push(candidates[c]);
    }
  });

  setTopCandidates(topCandidates);
}

function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [balance, setBalance] = useState(-1);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({
    wknd: null,
    voting: null
  });
  const [candidates, setCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);

  useEffect(() => {
    const { ethereum } = window;

    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
    };
    checkMetamaskAvailability();
    sethaveMetamask(true);
    setupWeb3(setWeb3, setAccount, setBalance, setContracts);
    getCandidates(setCandidates);
  }, []);

  return (
    <div className="App">
      <header>
        <p>Wakanda kekw</p>
      </header>
      <body>
        <p>
          WKND balance:
          {balance}
        </p>
        <button onClick={async () => register(contracts.voting, account)}>
          Register
        </button>
        <br />
        <br />
        <p>Candidates:</p>
        <div>
          {candidates ? candidates.map((c, id) => {
            return (
              <button onClick={async () => vote(contracts, account, id)} key={id}>
                {c.name} : {c.votes}
              </button>
            )
          }) : null }
        </div>

        <p>Top candidates:</p>
        <button
          onClick={async () => getTopCandidates(contracts.voting, candidates, setTopCandidates)}
        >
          Load top candidates
        </button>
        <div>
          {topCandidates ? topCandidates.map((c, id) => {
            return (
              <p key={id}>{id + 1}: {c.name}</p>
            )
          }) : null }
        </div>
      </body>
    </div>
  );
}

export default App;
