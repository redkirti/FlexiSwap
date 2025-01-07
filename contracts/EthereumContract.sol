// SPDX-License-Identifier: MIT

pragma solidity >=0.4.16 <0.9.0;

contract EthereumContract {
    enum Status {
        Blank,
        Initiated,
        Locked, // ETH was locked by buyer
        Set,    //intitiator address set by buyer
        Refunded, // ETH was refunded to buyer
        Claimed // ETH was sucessfully claimed by order initiator
    }
    
    struct bidDetails {
        address buyerOntAddress;
        uint rate;
        uint max;
        uint locked;
        uint timelock;
        bytes32 hashlock2;
        string secret;
        bool claimed;
    }

    struct respondOrder {
        address initiatorEthAddress;
        address initiatorOntAddress;
        address[] buyerEthAddress;
        bytes32 hashlock;
        bytes32 hashlock2;// Not required
        uint amount;
        uint refundTimelock;//Not required
        uint bidTimelock;
        string secret;
        Status status;
        mapping (address => bidDetails) bids; //indexed address is buyerEthAddress
    }

    mapping (bytes32 => respondOrder) public orderList; // hashlock => order data
    uint timelockDuration = 600; // set to 600 seconds for testing purposes
    uint bidtime = 300; //set to 300 seconds for testing

    function getArr(bytes32 hashlock) public view returns (address[] memory) {
        return orderList[hashlock].buyerEthAddress;
    }

    function getBids(bytes32 hashlock, address buyerEthAddress) public view returns(address, uint, uint, uint, uint, bytes32, string memory, bool) {
        bidDetails storage t =  orderList[hashlock].bids[buyerEthAddress];
        return (t.buyerOntAddress, t.rate, t.max, t.locked, t.timelock, t.hashlock2, t.secret, t.claimed);
    }

    function initiateOrder(bytes32 hashlock, address initiatorOntAddress, uint amount) public payable{
        if((orderList[hashlock].status!=Status.Blank) && (block.timestamp > orderList[hashlock].bidTimelock + 1200)){
            delete orderList[hashlock];
        }
        require(orderList[hashlock].status == Status.Blank, "Not a fresh hashlock");
        require(msg.value == 50000000000000, "Not provided the exact dex fees");
        orderList[hashlock].bidTimelock = block.timestamp + bidtime;
        orderList[hashlock].status = Status.Initiated;
        orderList[hashlock].amount = amount;
        orderList[hashlock].initiatorEthAddress = msg.sender;
        orderList[hashlock].initiatorOntAddress = initiatorOntAddress;
        // Can remove this and from struct as well
        orderList[hashlock].hashlock = hashlock;
    }

    function bid(bytes32 hashlock, address buyerOntAddress, uint rate, uint max) public{
        require(orderList[hashlock].status == Status.Initiated || orderList[hashlock].status==Status.Locked, "Transaction in Invalid State");
        require(block.timestamp<=orderList[hashlock].bidTimelock, "Bidding Period Ended");
        // If no one bid for the exchange control won't come here
        orderList[hashlock].buyerEthAddress.push(msg.sender);
        orderList[hashlock].bids[msg.sender].buyerOntAddress = buyerOntAddress;
        orderList[hashlock].bids[msg.sender].rate = rate;
        orderList[hashlock].bids[msg.sender].max = max;
        orderList[hashlock].status = Status.Locked;
    }


    function lock(bytes32 hashlock, bytes32 hashlock2) public payable{
        // Find the calling address belongs to buyerEthAddress array, otherwise anyone can enter
        require(orderList[hashlock].status == Status.Locked || orderList[hashlock].status == Status.Set, "Not in locked or Set state");
        require(orderList[hashlock].bids[msg.sender].buyerOntAddress != address(0), "You have not bidded"); 
        orderList[hashlock].bids[msg.sender].hashlock2 = hashlock2;
        orderList[hashlock].bids[msg.sender].locked = msg.value;
        orderList[hashlock].bids[msg.sender].timelock = block.timestamp + timelockDuration;
        orderList[hashlock].status = Status.Set;
        
    }


    function claimEth(bytes32 hashlock, address[] memory buyerEthAddress, string[] memory secret) public{
        require(orderList[hashlock].initiatorEthAddress == msg.sender, "Not the initiator");
        require(orderList[hashlock].status == Status.Set, "Order status should be Set");
        for (uint i = 0; i < buyerEthAddress.length; ++i) {
            require(orderList[hashlock].bids[buyerEthAddress[i]].timelock>block.timestamp, "Claim time ended");
            require(sha256(abi.encodePacked(secret[i])) == orderList[hashlock].bids[buyerEthAddress[i]].hashlock2, "Secret does not match the hashlock");
            payable(msg.sender).transfer(orderList[hashlock].bids[buyerEthAddress[i]].locked);
            orderList[hashlock].bids[buyerEthAddress[i]].claimed = true;
            orderList[hashlock].bids[buyerEthAddress[i]].secret = secret[i];
        }
        orderList[hashlock].status = Status.Claimed;   
    }

    function refundEth (bytes32 hashlock) public {
        require(orderList[hashlock].bids[msg.sender].claimed == false , "Already claimed");
        require((block.timestamp >= orderList[hashlock].bids[msg.sender].timelock) || (orderList[hashlock].status == Status.Claimed), "Timelock is not over or not yet claimed");
        require((orderList[hashlock].status == Status.Set) || (orderList[hashlock].status == Status.Claimed), "Order should be in Set or claimed state for refund");
        payable(msg.sender).transfer(orderList[hashlock].bids[msg.sender].locked);
    }
}
