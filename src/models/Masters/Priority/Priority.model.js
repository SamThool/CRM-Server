const mongoose = require('mongoose');

const prioritySchema = new mongoose.Schema(
  {
    priorityName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Priority', prioritySchema);
