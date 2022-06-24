# Voting-Dapp
Voting Daap:
### Hosted on: https://govote.on.fleek.co/

## How to setup this dApp
### Smart Contract:
1. Clone the project
2. Open terminal on the project and cd into "hardhat" folder
3. Run: npm install - to install all the dependences
4. Rename the .env.example file to .env and provide the values to the parameters
5. Run: npx hardhat compile - to compile your smart contracts
6. Run: npx hardhat run scripts/deploy.js --network ropsten
7. Copy the contract address that is logged on the console - you will need it to interact with the frontend

### Frontend:
1. cd into the client folder
2. Run npm install
3. Replace the contract address in the: constants/index.js
4. Replace the abis but this is optional
5. Run npm start

