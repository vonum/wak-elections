// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Voting is Ownable {
    // First value of the array is used for initializing top candidates to optimise gas
    // This way only the index can be used for the top 3 candidates
    uint256[11] public votes;
    mapping(address => bool) public voters;
    mapping(address => bool) public voted;

    uint8[3] public topCandidates;

    IERC20 public wknd;
    bool public votingStatus;

    event NewChallanger(uint8 candidate);
    event VoterRegistered(address voter);
    event Voted(address voter, uint8 candidate, uint256 value);

    modifier votingActive() {
        require(votingStatus, "Voting paused");
        _;
    }

    modifier validCandidate(uint8 candidate) {
        require(candidate < 12 && candidate > 0, "Invalid candidate");
        _;
    }

    modifier registeredVoter(address voter) {
        require(voters[voter], "Voter not registered");
        _;
    }

    constructor(IERC20 _wknd) {
        wknd = _wknd;
    }

    function setVotingStatus(bool status) external onlyOwner returns (bool) {
        votingStatus = status;
        return true;
    }

    function register() external returns (bool) {
        require(!voters[msg.sender], "Already registered");

        voters[msg.sender] = true;
        wknd.transfer(msg.sender, 1);

        emit VoterRegistered(msg.sender);

        return true;
    }

    function vote(uint8 candidate, uint256 value)
    external
    votingActive
    registeredVoter(msg.sender)
    validCandidate(candidate)
    returns (bool) {
        require(value > 0, "0 WKND tokens provided");
        require(!voted[msg.sender], "Already voted");

        bool wasTopCandidate = _isTopCondidate(candidate);

        wknd.transferFrom(msg.sender, address(this), value);

        votes[candidate] += value;
        voted[msg.sender] = true;

        emit Voted(msg.sender, candidate, value);

        _updateTopCandidates(candidate, votes[candidate]);

        bool isTopCondidate = _isTopCondidate(candidate);

        if (!wasTopCandidate && isTopCondidate) {
            emit NewChallanger(candidate);
        }

        return true;
    }

    function winningCandidates() external view returns (uint8[3] memory) {
        return topCandidates;
    }

    function candidateVotes() external view returns (uint256[10] memory) {
        uint256[10] memory _votes;
        for (uint256 i = 1; i < 11; i++) {
            _votes[i-1] = votes[i];
        }

        return _votes;
    }

    function _updateTopCandidates(uint8 candidate, uint256 _votes) private {
        uint8[3] memory _topCandidates = topCandidates;

        if (_votes > votes[_topCandidates[0]]) {
            // already 1st -> no change
            if (candidate == _topCandidates[0]) {
                return;
            // 2nd -> swap 1st and 2nd
            } else if (candidate == _topCandidates[1]) {
                (_topCandidates[1], _topCandidates[0])
                    = (_topCandidates[0], candidate);
            // 3rd or bellow -> push him to 1st, and move the rest down one place
            } else {
                (_topCandidates[2], _topCandidates[1], _topCandidates[0])
                    = (_topCandidates[1], _topCandidates[0], candidate);
            }
        } else if (_votes > votes[_topCandidates[1]]) {
            if (candidate == _topCandidates[0]) {
                return;
            }
            // already 2nd -> no change
            else if (candidate == _topCandidates[1]) {
                return;
            // 3rd or bellow -> push him to 2nd, and make 2nd place 3rd
            } else {
                (_topCandidates[2], _topCandidates[1])
                    = (_topCandidates[1], candidate);
            }
        } else if (_votes > votes[_topCandidates[2]]) {
            if (candidate == _topCandidates[0]) {
                return;
            }
            else if (candidate == _topCandidates[1]) {
                return;
            }
            if (candidate == _topCandidates[2]) {
                return;
            } else {
                _topCandidates[2] = candidate;
            }
        }

        topCandidates = _topCandidates;
    }

    function _isTopCondidate(uint8 candidate) private view returns (bool) {
        for (uint256 i = 0; i < 3; i++) {
            if (topCandidates[i] == candidate) {
                return true;
            }
        }

        return false;
    }
}
