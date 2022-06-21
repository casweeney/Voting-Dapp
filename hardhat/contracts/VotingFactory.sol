// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import './VotingPoll.sol';

contract VotingFactory {
    address[] public votingPolls;

    function allVotinPolls() external view returns (uint) {
        return votingPolls.length;
    }

    function createPoll(string calldata _title, string[] calldata _candidates) 
    external returns(address votingPoll) 
    {
        bytes memory bytecode = type(VotingPoll).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(address(0)));
        assembly{
            votingPoll := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IVotingPoll(votingPoll).createPoll(_title, _candidates);
        votingPolls.push(votingPoll);
    }
}