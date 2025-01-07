const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const txns = require('./models/txns');
const Web3 = require("web3");
var fs = require('fs');

// express app
const app = express();
// app.use(express.static(__dirname + '/public'));
app.listen(3000);

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://redkirti:Strong1234@cluster0.4oandf8.mongodb.net/orderbook?retryWrites=true&w=majority";

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(dbURI,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
        console.log('Listening on Port 3000')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

    const ethNetwork = 'https://sepolia.infura.io/v3/069b7d73ec604e52a5092610c9f410ea';
    const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
    const web3ont = new Web3(new Web3.providers.HttpProvider('https://polaris2.ont.io:10339'));
    async function func(hashlock){
        var jsonFile = "artifacts/contracts/OntologyContract.sol/OntologyContract.json";
        var parsed= JSON.parse(fs.readFileSync(jsonFile));
        var abiONT = parsed.abi;
        var jsonFile = "artifacts/contracts/EthereumContract.sol/EthereumContract.json";
        var parsed= JSON.parse(fs.readFileSync(jsonFile));
        var abiETH = parsed.abi;
        var contract = await new web3.eth.Contract(abiETH, '0x16731AB4cE3af35c5774e42fA06eAefb481D1628');
        var x = await contract.methods.orderList(hashlock).call();
        var contractont = await new web3ont.eth.Contract(abiONT, '0x1C2a6c5EaF6bFCEeF3f52c0e5e6DC89F8756E5D9');
        var y = await contractont.methods.orderList(hashlock).call();

        return {'hashlock':hashlock, 'amountOnt': x['amount'], 'bidTimelock':timeConverter(x['bidTimelock'])};

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

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.post('/txns', async (req, res) => {
    console.log(req.body);
    // const txn = new txns(req.body);
    var obj = await func(req.body['hashlock']);
    if(obj['amountOnt']!="0"){
        const txn = new txns(obj);
        txn.save().then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err);
        })
    }
    else{
        console.log('Empty or time exceeded');
    }
});
app.get('/txns', (req,res) => {
    txns.find().then((result) => {
        res.render('orderbook', {title: 'All Transactions', txns: result});
    })
    .catch((err) => {
        console.log(err);
    })
})

app.get('/', (req, res) => {
  res.render('index');
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});


