# wak-elections
Service providing voting functionalities.
Consists of:
1. Smart contract
2. Backend service that acts as an admin entrypoint to the smart contract
3. Application for interracting with the backend service and smart contract

## Requirements
1. Node
2. Docker
3. Ethereum node

## Setup
* `git clone git@github.com:vonum/wak-elections.git`

### Smart contract
* Install dependencies - `yarn`
* Run tests - `yarn test`
* Compile contract - `npx hardhat compile`
* Deploy contract - `npx hardhat run scripts/deploy.js --network rinkeby`

## Backend service
* `docker-compose up --build`

## Frontend app
* `yarn start`
