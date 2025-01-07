// SPDX-License-Identifier: MIT

pragma solidity >=0.4.16 <0.9.0;

contract OntologyContract {
    enum Status {
        Blank,
        Locked, // ONT tokens were locked by initiator
        Set,
        Refunded, // ONT was refunded to buyer
        Claimed // ONT was sucessfully claimed by order initiators
    }


    struct bidDetails {
        address buyerEthAddress;
        uint locked;
        bytes32 hashlock2;
    }

    struct initiatedOrder {
        address initiatorOntAddress;
        address initiatorEthAddress;
        address[] buyerOntAddress;
        bytes32 hashlock;
        uint amountOnt;
        uint refundTimelock;
        string secret;
        Status status;
        mapping (address => bidDetails) bids;
    }

    mapping (bytes32 => initiatedOrder) public orderList; // hashlock => order data
    uint timelockDuration = 900; // set to 900 seconds for testing purposes
    
    function getArr(bytes32 hashlock) public view returns (address[] memory) {
        return orderList[hashlock].buyerOntAddress;
    }

    function getBids(bytes32 hashlock, address buyerOntAddress) public view returns(address, uint, bytes32) {
        bidDetails storage t =  orderList[hashlock].bids[buyerOntAddress];
        return (t.buyerEthAddress, t.locked, t.hashlock2);
    }

    //ALICE HAS TO CHECK WHETHER BIDDING HAS FINISHED
    function lockandset(bytes32 hashlock, string memory secret, bytes32[] memory hashlocks, address[] memory buyerOntAddress, address[] memory buyerEthAddress, uint[] memory amount) public payable{
        if((orderList[hashlock].status!=Status.Blank) && ((block.timestamp-orderList[hashlock].refundTimelock)>120)){
            delete orderList[hashlock];
        }
        require(orderList[hashlock].status==Status.Blank, "Already in Use");
        require(sha256(abi.encodePacked(secret)) == hashlock, "Secret does not match the hashlock");
        // Only initiator can reach here
        orderList[hashlock].refundTimelock = block.timestamp + timelockDuration;
        orderList[hashlock].initiatorOntAddress = msg.sender;
        for(uint i = 0; i<hashlocks.length; ++i){
            orderList[hashlock].buyerOntAddress.push(buyerOntAddress[i]);
            orderList[hashlock].bids[buyerOntAddress[i]].buyerEthAddress = buyerEthAddress[i];
            orderList[hashlock].bids[buyerOntAddress[i]].hashlock2 = hashlocks[i];
            orderList[hashlock].bids[buyerOntAddress[i]].locked = amount[i];
        }

        // Check if locked amount is sum of all amounts in individual accounts
        uint totalamount = 0;
        for(uint j = 0; j<buyerOntAddress.length; ++j){
            totalamount += orderList[hashlock].bids[buyerOntAddress[j]].locked;
        }

        require(totalamount <= msg.value, "Not enough amount locked");
        orderList[hashlock].amountOnt = msg.value;
        orderList[hashlock].status = Status.Set;
    }


    function claimOnt(bytes32 hashlock, string memory secret) public {
        require(orderList[hashlock].status == Status.Set, "Order status should be locked");
        require(orderList[hashlock].bids[msg.sender].buyerEthAddress != address(0), "Initiator didn't choose you or haven't bidded");
        require(sha256(abi.encodePacked(secret)) == orderList[hashlock].bids[msg.sender].hashlock2, "Secret does not match the hashlock");
        payable(msg.sender).transfer(orderList[hashlock].bids[msg.sender].locked);
        orderList[hashlock].amountOnt -= orderList[hashlock].bids[msg.sender].locked;
    }

    function refundOnt (bytes32 hashlock) public {
        require(orderList[hashlock].status == Status.Set, "Order status should be locked");
        require(orderList[hashlock].initiatorOntAddress == msg.sender, "Can only be perfomed by order initiator");
        require(block.timestamp >= orderList[hashlock].refundTimelock, "Timelock is not over");

        orderList[hashlock].status = Status.Refunded;
        payable(msg.sender).transfer(orderList[hashlock].amountOnt);

        //Transaction Finished. Make the hash ready for probable other txn
        delete orderList[hashlock];
    }
}
