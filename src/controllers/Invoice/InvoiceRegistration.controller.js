const { InvoiceModel } = require("../../models/index");
const mongoose = require("mongoose");
const axios = require("axios");
const { calculateInvoiceTotals } = require("./calculateInvoice");

// const createInvoice = async (req, res) => {
//   try {
//     const { invoiceCategory, clientDetails, products, financialDetails, bankDetails, taxType } = req.body;

//     // Validate required fields
//     if (!invoiceCategory) {
//       return res.status(400).json({ message: "Invoice category is required." });
//     }

//     if (!clientDetails || !clientDetails.clientName || !clientDetails.clientEmail) {
//       return res.status(400).json({ message: "Client details are incomplete." });
//     }

//     if (!products || products.length === 0) {
//       return res.status(400).json({ message: "At least one product is required." });
//     }

//     if (!financialDetails || !financialDetails.subTotal || !financialDetails.totalAmount) {
//       return res.status(400).json({ message: "Financial details are incomplete." });
//     }

//     if (!bankDetails || !bankDetails.nameOnBankAccount || !bankDetails.bankAccountNumber) {
//       return res.status(400).json({ message: "Bank details are incomplete." });
//     }

//     // Additional validation for GST invoices
//     if (invoiceCategory === "gst") {
//       if (!clientDetails.clientGst || !taxType) {
//         return res.status(400).json({ message: "GST details are required for GST invoices." });
//       }
//     } else if (invoiceCategory === "nonGst") {
//       // Remove GST-related fields for non-GST invoices
//       if (clientDetails.clientGst) {
//         delete clientDetails.clientGst;
//       }
//     }

//     // Create and save the invoice
//     const invoice = new InvoiceModel(req.body);
//     await invoice.save();

//     res.status(201).json({ message: "Invoice created successfully!", invoice });
//   } catch (error) {
//     console.error("Error creating invoice:", error);
//     res.status(500).json({ message: "Error creating invoice", error });
//   }
// };

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
      selectedBankId
    } = req.body;

    console.log('invoice daata is', req.body);

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
      !selectedBankId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const isInvoiceNumberExists= await InvoiceModel.findOne({invoiceNumber: invoiceNumber});
    if (isInvoiceNumberExists) {
      return res.status(400).json({ message: "Invoice number must be unique",status:false });
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
      igstAmount,
      cgstIgstPercentage,
      cgstIgstAmount,
      sgstPercentage,
      sgstAmount,
      selectedBankId
    });

    const savedInvoice = await newInvoice.save();
    console.log('saved invoice data is',savedInvoice)
    res.status(200).json({ message: "Invoice created successfully",status:true, data: savedInvoice });
  } catch (error) {
    console.error("Create Invoice Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





const getAllInvoice= async (req, res) => {
  try {
    const invoices = await InvoiceModel.find().populate({
      path: 'selectedBankId',
      model: 'BankDetails',
    });
    res.status(200).json({ message: "Invoices fetched successfully",status:true, invoices });
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
    res.status(200).json({ message: "Invoice deleted successfully",status:true, deletedInvoice });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Error deleting invoice", error });
  }
};  
const getInvoiceById = async (req, res) => {
  try {
    console.log('getInvoiceById called with params:', req.params);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    const invoice = await InvoiceModel.findById(id).populate({
      path: 'selectedBankId',
      model: 'BankDetails',
    });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice fetched successfully",status:true, invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Error fetching invoice", error });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;  
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
      status,
      paymentDetails
    } = req.body;
    console.log('req boyd is',req.body)
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
      status,
    };
    if (paymentDetails && typeof paymentDetails === 'object' && paymentDetails.transactionId) {
      updateData.paymentDetails = {
        transactionId: paymentDetails.transactionId,
        paymentMode: paymentDetails.paymentMode,
        paidAmount: paymentDetails.paidAmount,
        paymentBankName: paymentDetails.paymentBankName,
        paymentDate: paymentDetails.paymentDate,
        invoiceId: paymentDetails.invoiceId
      };
    }
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(id, updateData, { new: true });
    console.log('udpated Inovice is',updatedInvoice)
    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    console.log('updatedInovice is',updatedInvoice)
    res.status(200).json({ message: "Invoice updated successfully",status:true, updatedInvoice });
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
  updateInvoice
};