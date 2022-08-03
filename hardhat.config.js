/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-docgen");

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
   solidity: "0.8.15",
   defaultNetwork: "goerli",
   networks: {
      hardhat: {},
      goerli: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  }
}
