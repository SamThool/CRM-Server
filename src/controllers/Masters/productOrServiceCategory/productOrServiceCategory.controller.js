const { default: mongoose } = require("mongoose");
const ProductOrServiceCategorymodel = require("../../../models/Masters/ProductOrServiceCategory/ProductOrServiceCategory.model");

const postProductOrServiceCategory = async (req, res) => {
  try {
    const { companyId } = req.query;
    const { productName } = req.body;
    console.log("req.user is", req.user);
    const Id = req.user.adminId || req.user.staffId;

    if (!productName) {
      return res.status(400).json({
        status: "false",
        message: "Product name is required",
      });
    }

    const newCategory = new ProductOrServiceCategorymodel({
      companyId,
      productName,
      createdBy: Id,
    });

    await newCategory.save();

    res.status(201).json({
      status: "true",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      status: "false",
      message: "Server error while creating category",
    });
  }
};

// getProductOrServiceCategory by admin
const getProductOrServiceCategory = async (req, res) => {
  try {
    const { companyId } = req.query;
    const Id = req.user.adminId || req.user.staffId; // From middleware

    if (!Id) {
      return res
        .status(401)
        .json({ status: "false", message: "Unauthorized: Admin ID missing" });
    }
    // log
    console.log("Admin ID from token:", Id);

    const categories = await ProductOrServiceCategorymodel.find({
      companyId: new mongoose.Types.ObjectId(companyId),
    }).sort({ createdAt: -1 });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        status: "false",
        message: "No categories found for this admin",
      });
    }

    res.status(200).json({
      status: "true",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      status: "false",
      message: "Server error while fetching categories",
    });
  }
};

const putProductOrServiceCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { productName } = req.body;
    const Id = req.user.adminId || req.user.staffId;

    console.log("Admin ID from token:", Id);

    if (!Id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Admin ID missing from token",
      });
    }

    const updatedCategory =
      await ProductOrServiceCategorymodel.findOneAndUpdate(
        { _id: id, createdBy: Id }, // ✅ only allow editing own category
        { productName },
        { new: true, runValidators: true }
      );

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found or you're not authorized to update it",
      });
    }

    res.status(200).json({
      status: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: false,
      message: ["Error updating category", error.message],
    });
  }
};

const deleteProductOrServiceCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const Id = req.user.adminId || req.user.staffId;

    if (!Id) {
      return res.status(401).json({
        status: "false",
        message: "Unauthorized: Admin ID missing from token",
      });
    }

    const deletedCategory =
      await ProductOrServiceCategorymodel.findOneAndDelete({
        _id: id,
        createdBy: Id,
      });

    if (!deletedCategory) {
      return res.status(404).json({
        status: "false",
        message: "Category not found or unauthorized to delete",
      });
    }

    res
      .status(200)
      .json({ status: "true", message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: "false",
      message: ["Error deleting category", error.message],
    });
  }
};

module.exports = {
  getProductOrServiceCategory,
  postProductOrServiceCategory,
  putProductOrServiceCategory,
  deleteProductOrServiceCategory,
};
