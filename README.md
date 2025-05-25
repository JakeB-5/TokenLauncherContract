# Token Launcher Contracts

## Overview
This folder contains Solidity smart contracts and the Hardhat development environment setup. It handles the core blockchain logic for the Token Launcher project.

- Solidity contracts implementing token minting and proxy patterns
- Hardhat configuration, deployment scripts, and tests
- Integration with Viem for interaction with contracts

## Structure

- `contracts/`: Solidity smart contracts
- `scripts/`: Deployment scripts written in TypeScript
- `test/`: Contract tests using viem and Hardhat toolbox

## Getting Started

```bash
yarn install
yarn hh:compile     # Compile the contracts
yarn hh:test        # Run contract tests
yarn hh:deploy      # Deploy contracts to localhost network
```
