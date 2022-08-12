import { useState, useEffect } from 'react';
import './App.css';

const wkndAbi = require("./assets/contracts/WKND.json");
const votingAbi = require("./assets/contracts/Voting.json");

const Web3 = require("web3");
const axios = require("axios");

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
  const [address, setAddress] = useState("");

  const [registerErrorMessage, setRegisterErrorMessage] = useState("");
  const [voteErrorMessage, setVoteErrorMessage] = useState("");
  const [voteValue, setVoteValue] = useState(1);


  const checkMetamaskAvailability = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      sethaveMetamask(false);
    }
  };

  const setupWeb3 = async () => {
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

  const getCandidates = async () => {
    const data = await axios.get(`${process.env.REACT_APP_APP_URL}/candidates`);
    console.log(data.data);
    setCandidates(data.data);
  }

  const getTopCandidates = async () => {
    const data = await contracts.voting.methods.winningCandidates().call();
    console.log(data);
    const topCandidates = [];
    data.forEach(c => {
      c = parseInt(c);
      if (c) {
        topCandidates.push(candidates[c - 1]);
      }
    });

    setTopCandidates(topCandidates);
  }

  const vote = async (candidate) => {
    try {
      console.log("Sending approval tx");
      const r1 = await contracts.wknd.methods
        .approve(process.env.REACT_APP_VOTING_CONTRACT_ADDRESS, voteValue)
        .send({from: account});
      console.log(r1);

      /*
      console.log("Sending vote tx");
      const r2 = await contracts.voting.methods
        .vote(candidate, 1)
        .send({from: account});
      console.log(r2);
      */
      const resp = await axios.post(`${process.env.REACT_APP_APP_URL}/vote`, {
        voter: account,
        candidate,
        value: voteValue
      });
    } catch (e) {
      console.log(e);
      console.log(e.response.data);
      setVoteErrorMessage(e.response.data);
    }
  }

  const register = async () => {
    try {
      /*
      console.log("Sending register tx");
      const success = await contracts.voting.methods.register().send({from: account});
      console.log(success);
      */
      const resp = await axios.post(`${process.env.REACT_APP_APP_URL}/register`, {
        voter: address
      });
    } catch (e) {
      console.log(e);
      console.log(e.response.data);
      setRegisterErrorMessage(e.response.data);
    }
  }

  useEffect(() => {
    (async () => {
      await checkMetamaskAvailability();
      await sethaveMetamask(true);
      await setupWeb3();
      await getCandidates();
    })();
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

        <input
          type="text"
          placeholder="Address"
          onChange={e => setAddress(e.target.value)}
          value={address}
        />
        <button onClick={async () => register()}>
          Register
        </button>
        <p>{registerErrorMessage}</p>
        <br />
        <br />
        <p>Candidates:</p>
        <div>
          {candidates ? candidates.map((c, id) => {
            return (
              <button onClick={async () => vote(id + 1, 1)} key={id}>
                {c.name} : {c.votes}
              </button>
            )
          }) : null }
        </div>
        <input
          type="number"
          min="1"
          onChange={e => setVoteValue(e.target.value)}
          value={voteValue}
        />

        <p>Top candidates:</p>
        <button
          onClick={async () => getTopCandidates()}
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
        <p>{voteErrorMessage}</p>
      </body>
    </div>
  );
}

export default App;
