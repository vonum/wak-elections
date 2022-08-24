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

## How to run
0. Set .env based on .env.example
    * `API_URL`
    * `PUBLIC_KEY`
    * `PRIVATE_KEY`
1. Deploy contracts -> `npx hardhat run scripts/deploy.js --network rinkeby`
2. Copy contract addresses to:
    * `.env`
    * `voting-app/.env.development` (or production)
3. Start containers -> `docker-compose up --build`

The service is running on port 3000 and the browser app is running on port 3001.
