const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductOrServiceCategorySchema = new Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    productName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductOrServiceCategorymodel = mongoose.model(
  "ProductOrServiceCategory",
  ProductOrServiceCategorySchema
);
module.exports = ProductOrServiceCategorymodel;
