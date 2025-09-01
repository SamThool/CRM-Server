const mongoose = require('mongoose');

const gstPercentageSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const GstPercentageModel = mongoose.model('GstPercentage', gstPercentageSchema);

module.exports = GstPercentageModel;
