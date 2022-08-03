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

    // initialize top candidates to something other than 0 or votes array to something other than 0
    uint8[3] public topCandidates;

    IERC20 public wknd;

    event NewChallanger(uint8 candidate);
    event VoterRegistered(address voter);
    event Voted(address voter, uint8 candidate, uint256 value);

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

    function register() external returns (bool) {
        require(!voters[msg.sender], "Already registered");

        voters[msg.sender] = true;
        wknd.transfer(msg.sender, 1);

        emit VoterRegistered(msg.sender);

        return true;
    }

    function vote(uint8 candidate, uint256 value)
    external registeredVoter(msg.sender) validCandidate(candidate)
    returns (bool) {
        require(value > 0, "0 WKND tokens provided");
        require(!voted[msg.sender], "Already voted");

        wknd.transferFrom(msg.sender, address(this), value);

        votes[candidate] += value;
        voted[msg.sender] = true;

        emit Voted(msg.sender, candidate, value);

        bool wasTopCandidate = _isTopCondidate(candidate);
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

    function _updateTopCandidates(uint8 candidate, uint256 _votes) private {
        uint8[3] memory _topCandidates = topCandidates;

        if (_votes > votes[_topCandidates[0]] && candidate != _topCandidates[0]) {
            if (candidate == _topCandidates[1]) {
                (_topCandidates[1], _topCandidates[0]) = (_topCandidates[0], candidate);
            } else {
                (_topCandidates[2], _topCandidates[1], _topCandidates[0])
                    = (_topCandidates[1], _topCandidates[0], candidate);
            }
        } else if (_votes > votes[_topCandidates[1]] && candidate != _topCandidates[1]) {
            (_topCandidates[2], _topCandidates[1]) = (_topCandidates[1], candidate);
        } else if (_votes > votes[_topCandidates[2]] && candidate != _topCandidates[2]){
            _topCandidates[2] = candidate;
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
