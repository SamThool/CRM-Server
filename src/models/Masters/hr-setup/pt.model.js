const mongoose = require('mongoose');

const ptSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('PT', ptSchema);