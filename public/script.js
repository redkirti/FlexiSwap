
async function loadContract1() {
    return await new window.web3.eth.Contract([
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "secret",
            "type": "string"
          }
        ],
        "name": "claimOnt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          }
        ],
        "name": "getArr",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "buyerOntAddress",
            "type": "address"
          }
        ],
        "name": "getBids",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "secret",
            "type": "string"
          },
          {
            "internalType": "bytes32[]",
            "name": "hashlocks",
            "type": "bytes32[]"
          },
          {
            "internalType": "address[]",
            "name": "buyerOntAddress",
            "type": "address[]"
          },
          {
            "internalType": "address[]",
            "name": "buyerEthAddress",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "amount",
            "type": "uint256[]"
          }
        ],
        "name": "lockandset",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "orderList",
        "outputs": [
          {
            "internalType": "address",
            "name": "initiatorOntAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initiatorEthAddress",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amountOnt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "refundTimelock",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "secret",
            "type": "string"
          },
          {
            "internalType": "enum OntologyContract.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          }
        ],
        "name": "refundOnt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ], '0x1C2a6c5EaF6bFCEeF3f52c0e5e6DC89F8756E5D9');
}

async function printOrderListOnt(hashlock){
    updateStatus('Fetching Order List...');
    const orderList = await window.contract1.methods.orderList(hashlock).call();     
    updateStatus(`Order List Fetched`);
    const ls = document.getElementById('orderListOnt');
    // const val = JSON.stringify(orderList)
    if(typeof orderList["refundTimelock"] !== "undefined"){
        var x = parseInt(orderList["refundTimelock"]);
        var t = timeConverter(x);
    }
    else{
        var t = orderList["refundTimelock"];
    }
    // console.log(typeof(val));
    ls.innerHTML = `
      <table>
          <tr><td class="pd">Hashlock:</td>              <td>${orderList["hashlock"]}</td></tr>
          <tr><td class="pd">Initiator ONT Address:</td> <td>${orderList["initiatorOntAddress"]}</td></tr>
          <tr><td class="pd">Initiator ETH Address:</td> <td>${orderList["initiatorEthAddress"]}</td></tr>
          <tr><td class="pd">Amount Ont:</td>            <td>${orderList["amountOnt"]}</td></tr>
          <tr><td class="pd">Refund Time:</td>           <td>${t}</td></tr>
          <tr><td class="pd">Status:</td>                <td>${orderList["status"]}</td></tr>
      </table>`;
    // console.log(orderList);
    const selectedBidsTable = document.getElementById('selectedBidsTable');
    selectedBidsTable.innerHTML=`
      <thead>
        <th>Buyer Ont Address</th>
        <th>Buyer ETH Address</th>
        <th>Locked Amount</th>
        <th>New hashlock</th>
      </thead>`;
    const buyerOntAddress = await window.contract1.methods.getArr(hashlock).call();
    console.log(buyerOntAddress);
    for(var i=0; i<buyerOntAddress.length; i++){
        const bidDetails = await window.contract1.methods.getBids(hashlock, buyerOntAddress[i]).call();
        console.log(bidDetails);
        let row = selectedBidsTable.insertRow(-1);
        let c1 = row.insertCell(-1);
        c1.innerText = buyerOntAddress[i];
        for(var j=0; j<3; j++){
            let c = row.insertCell(-1);
            c.innerText = bidDetails[j];
        }
    }

    if(buyerOntAddress.length>0){
      const selectedBidsDiv = document.getElementById('selectedBidsDiv');
      selectedBidsDiv.removeAttribute("hidden");
    }
    

    var slides = document.getElementsByName("hashlock");
    hashlock = document.getElementById('hash5').value;
    for (var i = 0; i < slides.length; i++) {
        slides.item(i).setAttribute("value", hashlock);
    }
}

async function lockAndSet(hashlock, secret, hashlocks, buyerOntAddresses, buyerEthAddresses, amounts, amountOnt){
    const account = await getCurrentAccount();
    hashlocks = hashlocks.split(",");
    buyerEthAddresses = buyerEthAddresses.split(",");
    buyerOntAddresses = buyerOntAddresses.split(",");
    amounts = amounts.split(",");
    const res = await window.contract1.methods.lockandset(hashlock, secret, hashlocks, buyerOntAddresses, buyerEthAddresses, amounts ).send({from: account, value: amountOnt});
    updateStatus('Order Initiated By Locking.');
}

async function claimOnt(hashlock, secret){
    const account = await getCurrentAccount();
    const res = await window.contract1.methods.claimOnt(hashlock, secret).send({from: account});
    updateStatus('Claimed.');
}

async function refundOnt(hashlock){
    const account = await getCurrentAccount();
    const res = await window.contract1.methods.refundOnt(hashlock).send({from: account});
    updateStatus('Refunded.');
}

// async function notifyforbid(){
//     var timerID = setInterval(async function() {
//         const orderList = await window.contract2.methods.orderList(hashlock).call();
//         var t = Date.now()
//         var bidtime = parseInt(orderList["bidTimelock"]);
//         if(t>bidtime){
//             alert("Bidding Ended");
//             clearInterval(timerID);
//         }
//     }, 10 * 1000); 
// }
var stateeth=2;
async function notifyforstateineth(){
    var timerID = setInterval(async function() {
        const orderList = await window.contract2.methods.orderList(hashlock).call();
        var t = Date.now()
        var refundtime = parseInt(orderList["refundTimelock"]);
        if(t>refundtime){
            alert("Refund Timelock Ended");
            clearInterval(timerID);
        }
        var checkstate = parseInt(orderList["status"]);
        if(checkstate !== stateeth){
            stateeth = checkstate;
            if(stateeth === 3){
                alert("Initiator address set");
            }
            else if(stateeth === 4){
                alert("ETH was refunded");
            }
            else if(stateeth === 4){
                alert("ETH was refunded");
            }
        }

    }, 10 * 1000); 
}



// function checkbidtime(hashlock, tid){
//     // const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
//     // await waitFor(15000);
//     var y = setInterval(async function(){
//         const orderList = await window.contract2.methods.orderList(hashlock).call();
//         btlock = orderList["bidTimelock"];
//         if(btlock != 0){
//             clearInterval(y);
//             countdown(tid, btlock);
//         }
//     }, 10000);
// }

// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getBidTimeLock(hashlock, initiatorOntAddress, amountOnt, tid){
    if(tid == "bidtimer1"){
        await initiateOrder(hashlock, initiatorOntAddress, amountOnt);
        var slides = document.getElementsByName("hashlock");
        for (var i = 0; i < slides.length; i++) {
            slides.item(i).setAttribute("value", hashlock);
        }
        document.getElementById('todb').submit();
        // await sleep(10000);
    }
    const orderList = await window.contract2.methods.orderList(hashlock).call();
    var tl = parseInt(orderList["bidTimelock"]);
    // if(tid == "bidtimer1"){
    //     document.getElementById('bidTimelock3').value=timeConverter(tl);
        
    // }
    countdown("bidtimer2", tl);
}

function countdown(tid, tl){
    var x = setInterval(function(){
        if(tl != 0){
            var currentTime = Math.floor(Date.now()/1000);
            var diff = tl - currentTime;
            console.log(tl);
            var minutes = Math.floor((diff % (60 * 60)) / (60));
            var seconds = Math.floor((diff % (60)));
            if (diff < 0) {
                document.getElementById(tid).innerHTML=``;
                alert("Bidding Ended");
                clearInterval(x);

            }
            else{
                document.getElementById(tid).innerHTML=`<h2>${minutes}min ${seconds}sec</h2>`;
            }
        }
    },1000);
}



/*=============================================================================================================================================*/


async function loadContract2() {
    return await new window.web3.eth.Contract([
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "buyerOntAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "rate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          }
        ],
        "name": "bid",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "address[]",
            "name": "buyerEthAddress",
            "type": "address[]"
          },
          {
            "internalType": "string[]",
            "name": "secret",
            "type": "string[]"
          }
        ],
        "name": "claimEth",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          }
        ],
        "name": "getArr",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "buyerEthAddress",
            "type": "address"
          }
        ],
        "name": "getBids",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "initiatorOntAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "initiateOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "hashlock2",
            "type": "bytes32"
          }
        ],
        "name": "lock",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "orderList",
        "outputs": [
          {
            "internalType": "address",
            "name": "initiatorEthAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initiatorOntAddress",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "hashlock2",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "refundTimelock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bidTimelock",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "secret",
            "type": "string"
          },
          {
            "internalType": "enum EthereumContract.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          }
        ],
        "name": "refundEth",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ], '0x16731AB4cE3af35c5774e42fA06eAefb481D1628');
}

async function printOrderListEth(hashlock){
    updateStatus('Fetching Order List...');
    const orderList = await window.contract2.methods.orderList(hashlock).call();    
    updateStatus(`Order List: ${orderList}`);
    const ls = document.getElementById('orderListEth');
    if(typeof orderList["refundTimelock"] !== "undefined"){
        var x = parseInt(orderList["refundTimelock"]);
        console.log(x);
        var t1 = timeConverter(x);
    }
    else{
        var t1 = orderList["bidTimelock"];
    }

    if(typeof orderList["bidTimelock"] !== "undefined"){
        var y = parseInt(orderList["bidTimelock"]);
        var t2 = timeConverter(y);
    }
    else{
        var t2 = orderList["bidTimelock"];
    }
    // const val = JSON.stringify(orderList)
    // console.log(typeof(val));
    ls.innerHTML = `<table>
        <tr><td>Initiator ETH Address:</td> <td>${orderList["initiatorEthAddress"]}</td></tr>
        <tr><td>Initiator ONT Address:</td> <td>${orderList["initiatorOntAddress"]}</td></tr>
        <tr><td>Amount ONT:</td>            <td>${orderList["amount"]}</td></tr>
        <tr><td>Hashlock:</td>              <td>${orderList["hashlock"]}</td></tr>
        <tr><td>Bidding Time Period:</td>   <td>${t2}</td></tr>
        <tr><td>Secret:</td>                <td>${orderList["secret"]}</td></tr>
        <tr><td>Status:</td>                <td>${orderList["status"]}</td></tr>
    </table>`;
    console.log(orderList);
    const bidDivTable = document.getElementById('bidDetailsTable');
    bidDivTable.innerHTML = `<thead>
            <th>Buyer ETH Address</th>
            <th>Buyer ONT Address</th>
            <th>Rate</th>
            <th>Max</th>
            <th>Locked Amount</th>
            <th>Timelock</th>
            <th>New Hashlock</th>
            <th>Secret</th>
            <th>Claimed</th>
        </thead>`;
    const buyerEthAddress = await window.contract2.methods.getArr(hashlock).call();
    for(var i=0; i<buyerEthAddress.length; i++){
        const bidDetails = await window.contract2.methods.getBids(hashlock, buyerEthAddress[i]).call();
        console.log(bidDetails);
        console.log(typeof bidDetails);
        console.log(bidDetails[1]);
        console.log(bidDetails["1"]);
        let row = bidDivTable.insertRow(-1);
        let c1 = row.insertCell(-1);
        c1.innerText = buyerEthAddress[i];
        for(var j=0; j<8; j++){
            c1 = row.insertCell(-1);
            c1.innerText = bidDetails[j];
            console.log(bidDetails[j]);
        }
    }
    
    if (buyerEthAddress.length>0) {
      const bidDetailsDiv = document.getElementById('bidDetailsDiv');
      bidDetailsDiv.removeAttribute("hidden");
    }
    

    var slides = document.getElementsByName("hashlock");
    hashlock = document.getElementById('hash6').value;
    for (var i = 0; i < slides.length; i++) {
        slides.item(i).setAttribute("value", hashlock);
    }
    getBidTimeLock(hashlock, "bidtimer2");
}

async function initiateOrder(hashlock, initiatorOntAddress, amountOnt){
    const account = await getCurrentAccount();
    const res = await window.contract2.methods.initiateOrder(hashlock, initiatorOntAddress, amountOnt).send({from: account, value:50000000000000});
    updateStatus('Bidding Initiated.');
    document.getElementById('hash12').value=hashlock;
}

async function bid(hashlock, buyerOntAddress, rate, maxEth){
    const account = await getCurrentAccount();
    const res = await window.contract2.methods.bid(hashlock, buyerOntAddress, rate ,maxEth).send({from: account});
    updateStatus('Bid Placed.');
}

async function lockEth(hashlock, hashlock2, amountEth){
    const account = await getCurrentAccount();
    const res = await window.contract2.methods.lock(hashlock, hashlock2).send({from: account, value: amountEth});
    updateStatus('ONT Locked.');
}

async function claimEth(hashlock, buyerEthAddresses2 ,secrets){
    const account = await getCurrentAccount();
    buyerEthAddresses2 = buyerEthAddresses2.split(",");
    secrets = secrets.split(",");
    const res = await window.contract2.methods.claimEth(hashlock, buyerEthAddresses2,secrets).send({from: account});
    updateStatus('Claimed.');
}

async function refundEth(hashlock){
    const account = await getCurrentAccount();
    const res = await window.contract2.methods.refundEth(hashlock).send({from: account});
    updateStatus('Refunded.');
}





/*=============================================================================================================================================*/

async function load() {
    await loadWeb3();
    document.getElementById("ONT").style.display = "none";
    document.getElementById("ETH").style.display = "none";
    document.getElementById("lt1").style.display = "none";
    document.getElementById("co1").style.display = "none";
    document.getElementById("ro1").style.display = "none";
    document.getElementById("io1").style.display = "none";
    document.getElementById("b1").style.display = "none";
    document.getElementById("ce1").style.display = "none";
    document.getElementById("re1").style.display = "none";
    document.getElementById("le1").style.display = "none";
    window.contract1 = await loadContract1();
    window.contract2 = await loadContract2();
    updateStatus('Ready!');
    console.log('Loaded');
}

async function getCurrentAccount() {
    const accounts = await window.web3.eth.getAccounts();
    return accounts[0];
}

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.request({method: 'eth_requestAccounts'})
    }
    else{
        alert('Install Metamask');
    }
}

async function ontologynet(){
    if(window.ethereum) {
        try{
            window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{chainId: '0x16DB',
                  chainName: "Ontology TestNet",
                  nativeCurrency: {
                    name: "ONT",
                    symbol: "ONT",
                    decimals: 18
                  },
                  rpcUrls: ['https://polaris2.ont.io:10339'],     blockExplorerUrls: ['https://explorer.ont.io/testnet']
            }]
            });
        }
        catch(switchError){
            if (switchError.code === 4902) {
                console.log("This network is not available in your metamask, please add it")
               }
            console.log("Failed to switch to the network")
        }
      }
}

async function goerli(){
    if(window.ethereum){
        try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x5'}],
            });
          console.log("You have succefully switched to Goerli Test network")
          } catch (switchError) {
            if (switchError.code === 4902) {
             console.log("This network is not available in your metamask, please add it")
            }
            console.log("Failed to switch to the network")
          }
    }
}


async function sepolia(){
    if(window.ethereum){
        try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7'}],
            });
          console.log("You have succefully switched to Sepolia Test network")
          } catch (switchError) {
            if (switchError.code === 4902) {
             console.log("This network is not available in your metamask, please add it")
            }
            console.log("Failed to switch to the network")
          }
    }
}

function updateStatus(status) {
    const statusEl = document.getElementById('status');
    statusEl.innerHTML = status;
    console.log(status);
}

async function showElement(selector) {
    document.getElementById(selector).style.display = "block";
    if(selector == 'ETH'){
        document.getElementById('ETHBut').classList.add("netbut");
        document.getElementById('ONTBut').classList.remove("netbut");
        await sepolia();
    }
    else{
        document.getElementById('ONTBut').classList.add("netbut");
        document.getElementById('ETHBut').classList.remove("netbut");
        await ontologynet();
    }
}

function hideElement(selector) {
    document.getElementById(selector).style.display = "none";
}

function showhide(selector){
    var blks = document.getElementsByName('block');
    for (var i = 0; i < blks.length; i++) {
        blks.item(i).style.display = 'none';
    }
    document.getElementById(selector+"1").style.display = 'block';
}

function showhide2(selector){
    var blks = document.getElementsByName('block2');
    for (var i = 0; i < blks.length; i++) {
        blks.item(i).style.display = 'none';
    }
    document.getElementById(selector+"1").style.display = 'block';
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  load();