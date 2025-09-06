const { InvoiceModel } = require("../../models/index");
const mongoose = require("mongoose");
const axios = require("axios");
const { calculateInvoiceTotals } = require("./calculateInvoice");

const createInvoice = async (req, res) => {
  try {
    const {
      gstType,
      clientId,
      clientName,
      RecieptNo,
      invoiceNumber,
      date,
      clientGst,
      clientEmail,
      clientAddress,
      clientPincode,
      clientState,
      clientCity,
      clientCountry,
      products,
      subTotal,
      discount,
      discountType,
      discountAmount,
      totalAmount,
      roundUp,
      igstPercent,
      igstAmount,
      cgstIgstPercentage,
      cgstIgstAmount,
      sgstPercentage,
      sgstAmount,
      selectedBankId,
    } = req.body;

    const { companyId } = req.query;

    console.log("invoice daata is", req.body);

    // Validate required fields
    if (
      !gstType ||
      !clientName ||
      !RecieptNo ||
      !invoiceNumber ||
      !date ||
      !clientEmail ||
      !clientAddress ||
      !clientPincode ||
      !clientState ||
      !clientCity ||
      !clientCountry ||
      !products ||
      !subTotal ||
      !totalAmount ||
      !selectedBankId ||
      !companyId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const isInvoiceNumberExists = await InvoiceModel.findOne({
      invoiceNumber: invoiceNumber,
    });
    if (isInvoiceNumberExists) {
      return res
        .status(400)
        .json({ message: "Invoice number must be unique", status: false });
    }
    const newInvoice = new InvoiceModel({
      gstType,
      clientId,
      clientName,
      RecieptNo,
      invoiceNumber,
      date,
      clientGst,
      clientEmail,
      clientAddress,
      clientPincode,
      clientState,
      clientCity,
      clientCountry,
      products,
      subTotal,
      discount,
      discountType,
      discountAmount,
      totalAmount,
      roundUp,
      igstPercent,
      companyId,
      igstAmount,
      cgstIgstPercentage,
      cgstIgstAmount,
      sgstPercentage,
      sgstAmount,
      selectedBankId,
    });

    const savedInvoice = await newInvoice.save();
    console.log("saved invoice data is", savedInvoice);
    res.status(200).json({
      message: "Invoice created successfully",
      status: true,
      data: savedInvoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllInvoice = async (req, res) => {
  try {
    const { companyId } = req.query;
    const invoices = await InvoiceModel.find({
      companyId: new mongoose.Types.ObjectId(companyId),
    }).populate({
      path: "selectedBankId",
      model: "BankDetails",
    });
    res.status(200).json({
      message: "Invoices fetched successfully",
      status: true,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices", error });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({
      message: "Invoice deleted successfully",
      status: true,
      deletedInvoice,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Error deleting invoice", error });
  }
};
const getInvoiceById = async (req, res) => {
  try {
    console.log("getInvoiceById called with params:", req.params);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    const invoice = await InvoiceModel.findById(id).populate({
      path: "selectedBankId",
      model: "BankDetails",
    });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res
      .status(200)
      .json({ message: "Invoice fetched successfully", status: true, invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Error fetching invoice", error });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Invoice ID to update:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid invoice ID:", id);
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const {
      clientId,
      clientName,
      invoiceNumber,
      date,
      clientGst,
      clientEmail,
      clientAddress,
      clientPincode,
      clientState,
      clientCity,
      clientCountry,
      products,
      subTotal,
      discount,
      discountType,
      discountAmount,
      totalAmount,
      roundUp,
      igstPercent,
      igstAmount,
      cgstIgstPercentage,
      cgstIgstAmount,
      sgstPercentage,
      sgstAmount,
      selectedBankId,
      paymentDetails,
    } = req.body;

    console.log("Request body:", req.body);

    const updateData = {
      clientId,
      clientName,
      invoiceNumber,
      date,
      clientGst,
      clientEmail,
      clientAddress,
      clientPincode,
      clientState,
      clientCity,
      clientCountry,
      products,
      subTotal,
      discount,
      discountType,
      discountAmount,
      totalAmount,
      roundUp,
      igstPercent,
      igstAmount,
      cgstIgstPercentage,
      cgstIgstAmount,
      sgstPercentage,
      sgstAmount,
      selectedBankId,
    };

    let updatedInvoice;

    if (paymentDetails && typeof paymentDetails === "object") {
      console.log("Updating invoice with payment details:", paymentDetails);

      const normalizedPayment = {
        ...paymentDetails,
        paidAmount: Number(paymentDetails.paidAmount) || 0,
      };
      console.log("Normalized payment details:", normalizedPayment);

      updatedInvoice = await InvoiceModel.findByIdAndUpdate(
        id,
        {
          $push: { history: normalizedPayment },
          $set: { paymentDetails: normalizedPayment },
        },
        { new: true }
      );

      if (!updatedInvoice) {
        console.log("Invoice not found after payment update:", id);
        return res.status(404).json({ message: "Invoice not found" });
      }

      const totalPaid = updatedInvoice.history.reduce(
        (sum, p) => sum + Number(p.paidAmount || 0),
        0
      );
      console.log("Total paid so far:", totalPaid);

      const roundValue = Number(updatedInvoice.roundUp) || 0;
      console.log("Invoice roundUp value:", roundValue);

      let newStatus = "unpaid";
      const totalPaidFixed = Number(totalPaid.toFixed(2));
      const roundValueFixed = Number(roundValue.toFixed(2));

      if (totalPaidFixed >= roundValueFixed && roundValueFixed > 0) {
        newStatus = "paid";
      } else if (totalPaidFixed > 0 && totalPaidFixed < roundValueFixed) {
        newStatus = "pending";
      }
      console.log("Calculated new invoice status:", newStatus);

      updatedInvoice.totalPaidAmount = totalPaid;
      updatedInvoice.status = newStatus;

      await updatedInvoice.save();
      console.log("Updated invoice after payment save:", updatedInvoice);
    } else {
      console.log("Updating invoice without payment details");
      updatedInvoice = await InvoiceModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      console.log("Updated invoice:", updatedInvoice);
    }

    if (!updatedInvoice) {
      console.log("Invoice not found at final check:", id);
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      status: true,
      updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Error updating invoice", error });
  }
};

module.exports = {
  createInvoice,
  getAllInvoice,
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
};
