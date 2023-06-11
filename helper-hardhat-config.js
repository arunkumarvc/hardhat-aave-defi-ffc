const networkConfig = {
    31337: {
        name: "localhost",

        // https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",

        // https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
        lendingPoolAddressesProvider:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",

        // https://docs.chain.link/data-feeds/price-feeds/addresses#Ethereum%20Mainnet
        daiEthPriceFeed: "0x773616e4d11a78f511299002da57a0a94577f1f4",

        // https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },

    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },

    80001: {
        name: "mumbai",
        ethUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
    },

    /* 
       31337: {
        name: "localhost",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    */
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
};
