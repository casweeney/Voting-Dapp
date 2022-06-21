// SPDX:License-Identifier: MIT
pragma solidity ^0.8.1;

import './interface/IVotingPoll.sol';

contract VotingPoll is IVotingPoll {
    
    address public immutable override factory;
    string public title;

    Candidate[] public candidates;
    mapping(address => Voter) public voters;

    constructor(){factory = msg.sender;}

    function createPoll(string calldata _title, string[] calldata _candidates) external override {
        title = _title;
        for (uint i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({
                name: _candidates[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint candidate) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = candidate;

        // If 'proposal' is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        candidates[candidate].voteCount += 1;
    }

    function winningCandidate() public view returns (uint _winningCandidate) {
        uint winningVoteCount = 0;

        for (uint p = 0; p < candidates.length; p++) {
            if (candidates[p].voteCount > winningVoteCount) {
                winningVoteCount = candidates[p].voteCount;
                _winningCandidate = p;
            }
        }
    }

    function winnerName() public view returns (string memory _winnerName) {
        _winnerName = candidates[winningCandidate()].name;
    }
}