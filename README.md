# ERC20 Management with a Safe Multi-sig Account

Explore ERC20 token lock managed by a multisig account powered by <a href="https://github.com/safe-global/safe-smart-account">Safe-Smart-Account</a> utilising  <a href="https://hardhat.org/">Hardhat</a>

## Installation

### Node Version
18

### Git
    $ git clone https://github.com/Bentl22a9/multi-sig-erc20.git
    $ cd ./multi-sig-erc20
    $ git submodule init
    $ git submodule update


### Node Modules

multi-sig-erc20-demo

    $ cd./multi-sig-erc20-demo
    $ npm i

safe-smart-account

    $ cd ./safe-smart-account
    $ git checkout v1.3.0-libs.0 // The safe-smart-account version used for the project
    $ yarn 

### ENV

Copy provided .env files into each directory root


## Deploy Safe Contracts to Local Hardhat Network

Spin local hardhat node

    $ cd ./multi-sig-erc20-demo
    $ npx hardhat node

Deploy the safe contracts

    $ cd ./safe-smart-account
    $ yarn build
    $ yarn deploy custom

## Test

    $ cd ./multi-sig-erc20-demo
    $ npx hardhat test --network localhost
