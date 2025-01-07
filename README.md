# Flexi Swap

This project implements HTLC based atomic swap between Ontology and Ethereum with an on chain bidding on the Ethereum chain.

Currently swap can be done only when order is initiated via Ontology and responded via Ethereum.

Stack used:  
NodeJS: For creating a javascript environment that works as server   
Express: For routing   
MetaMask: Signing transactions  
Hardhat : Compiling and deploying smart contracts   
MongoDB Atlas: For storing the current bids in progress.   

Languages used:   
Solidity   
Javascript   


Deploy contracts using:  npx hardhat run --network sepolia scripts/deployeth.js and deployont.js for ontology_testnet

1. npm install
2. Setup metamask wallet
3. Configure two networks in metamask:

    ONTOLOGY TESTNET   
    Network name - Ontology TestNet   
    New RPC URL - https://polaris2.ont.io:10339    
    Chain ID - 5851   
    Currency symbol - ONT   
    Block explorer URL(Optional) - https://explorer.ont.io/testnet   

    GOERLI TESTNET    
    Network name - Goerli test network   
    New RPC URL - https://goerli.infura.io/v3/    
    Chain ID - 5    
    Currency symbol - GoerliETH   
    Block explorer URL(Optional) - https://goerli.etherscan.io   

4. Run npm app.js
5. localhost:3000 -> For the platform
6. localhost:3000/txns -> For the order book