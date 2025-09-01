require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337
    },
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      accounts: ["d14d407c90c179b932292b6a8547763a6c5eed4c9812a81638a5be05468eb587"],
      gasPrice: 30000000000, // 30 gwei (lower gas price)
      gas: 3000000 // Lower gas limit
    }
  }
};
