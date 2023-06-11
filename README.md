# Hardhat Aave Defi

This Project deposits ETH into the Aave protocol and then borrows DAI against that ETH collateral.

## Requirements

-   Node.js
-   Hardhat

## Installation

1. Install Node.js.
2. Install Hardhat.

## Usage

1. Clone the repository
2. Add .env file for Mainnet API Keys
3. In the project directory, run the following command to install dependencies

```
yarn install
```

3. Running the below command will deposits ETH & borrows DAI and then repays the borrowed DAI the the aave:

```
yarn hardhat run scripts/aaveBorrow.js
```

## Example Output

```
deployer balance: 100000000000000000000 WETH
0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Lending address: 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Approved!
Depositing WETH...
Deposited!
Getting the users account data
You have 100000000000000000000 worth of ETH deposited,
You have 0 worth of ETH borrowed.
You can borrow 82500000000000000000 worth of ETH.
The DAI/ETH price is 568972083023518
You can borrow 137748.41040269533 DAI
You can borrow 137748410402695330000000 Wei DAI
You've borrowed!
You have 100000001162005158797 worth of ETH deposited,
You have 78374999999999997840 worth of ETH borrowed.
You can borrow 4125000958654258168 worth of ETH.
Approved!
Repaid!
You have 100000001975408769955 worth of ETH deposited,
You have 4134548799740 worth of ETH borrowed.
You can borrow 82499997495163435473 worth of ETH.
```

## Further Reading

-   [Aave Documentation](https://docs.aave.com/)
-   [Hardhat Documentation](https://hardhat.org/)
