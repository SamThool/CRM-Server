const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    statusName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const statusModel = mongoose.model("status", statusSchema);
module.exports = statusModel;
