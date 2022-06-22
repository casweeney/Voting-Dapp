export const VOTING_FACTORY_CONTRACT_ADDRESS = "0x0519C43Cdf9B75Ba0a265B3330655A0cAF6D4ED3";

export const VOTING_FACTORY_ABI = [
    {
      "inputs": [],
      "name": "allVotingPolls",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_candidates",
          "type": "string[]"
        }
      ],
      "name": "createPoll",
      "outputs": [
        {
          "internalType": "address",
          "name": "votingPoll",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "votingPolls",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]