const mongoose = require("mongoose");

const LeaveManagerSchema = new mongoose.Schema(
  {
    staffName: {
      type: String,
    },
    leaveType: {
      type: String,
    },

    status: {
      type: String,
    },
    noOfDays: {
      type: Number,
      trim: true,
    },
    reason: {
      type: String,
    },

    delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveManagerModel = mongoose.model("LeaveManager", LeaveManagerSchema);

module.exports = LeaveManagerModel;
