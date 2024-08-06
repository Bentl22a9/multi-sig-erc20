# Demo: Safe Multi-Sig Controlled ERC20 Lock and Release in Hardhat

## Description

This repository presents a demonstration project using <a href="https://hardhat.org/">Hardhat</a> to implement and test ERC20 token lock and release features controlled by <a href="https://github.com/safe-global/safe-smart-account">Safe (Gnosis Safe) multi-signature wallets</a>.

## Prerequisites

<ul>
    <li>Node v18+</li>
    <li>Git</li>
</ul>

## Installation

Clone the repository and intialise the submodule:


    $ git clone https://github.com/Bentl22a9/multi-sig-erc20.git
    $ cd ./multi-sig-erc20
    $ git submodule init
    $ git submodule update


### Install dependencies

multi-sig-erc20-demo

    $ cd./multi-sig-erc20-demo
    $ npm i

safe-smart-account

    $ cd ./safe-smart-account
    $ git checkout v1.3.0-libs.0 // The safe-smart-account version used for the project
    $ yarn 

### .env

    $ cd ./safe-smart-account
    $ cp ./.env.sample .env

Open the `.env` file and insert your values:)

## Usage

### Deploying safe contracts to the local hardhat network

Spin the local hardhat node

    $ cd ./multi-sig-erc20-demo
    $ npx hardhat node

Deploy the safe contracts

    $ cd ./safe-smart-account
    $ yarn build
    $ yarn deploy custom

## Test

    $ cd ./multi-sig-erc20-demo
    $ npx hardhat test --network localhost

### Running a script on the target network

    $ cd ./multi-sig-erc20-demo
    $ npx hardhat run scripts/{scriptName.ts} --network {network} 
