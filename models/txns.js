const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const txnsSchema = new Schema({
  hashlock: {
    type: String,
    required: true,
  },
  amountOnt: {
    type: String,
    required: true,
  },
  bidTimelock: {
    type: String,
    required: true
  }
}, { timestamps: true });

const txns = mongoose.model('txns', txnsSchema);
module.exports = txns;