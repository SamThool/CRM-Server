const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    networkName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const NetworkModel = mongoose.model("network", networkSchema);
module.exports = NetworkModel;
