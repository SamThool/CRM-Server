const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    designation: { type: String },
    phone: { type: String },
    department: {
      type : String
    },
  },
  {
    timestamps: true,
  }
);

const contactModel = mongoose.model("contact", contactSchema);
module.exports = contactModel;
