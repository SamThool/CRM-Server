const mongoose = require("mongoose");
const { leadModel } = require("../../models/index");
const { prospectModel } = require("../../models/index");
const { contactModel } = require("../../models/index");
const { leadReferenceModel } = require("../../models/index");
const { ProductOrServiceCategorymodel } = require("../../models/index");
const { leadStatusModel } = require("../../models/index");
const { leadTypeModel } = require("../../models/index");

const createLeadController = async (req, res) => {
  try {
    // Sanitize reference fields
    [
      "Prospect",
      "Client",
      "reference",
      "productService",
      "leadstatus",
      "leadType",
      "assignTo",
    ].forEach((key) => {
      if (!req.body[key] || req.body[key] === "") req.body[key] = undefined;
    });

    const { companyId } = req.query;

    // Destructure fields, including newCompanyName for newLead case
    let {
      Prospect,
      Client,
      newCompanyName,
      // firstName,
      // middleName,
      // lastName,
      // gender,
      countryCode,
      phoneNo,
      altPhoneNo,
      email,
      altEmail,
      notes,
      address,
      pincode,
      city,
      state,
      country,
      reference,
      productService,
      leadstatus,
      leadType,
      projectValue,
      assignTo,
      contact = [],
      followups = [],
      leadCategory,
      companyName,
    } = req.body;

    // Validation: required fields
    const requiredFields = [
      // "firstName",
      // "lastName",
      // "gender",
      "countryCode",
      "phoneNo",
      "email",
      "address",
      "pincode",
      "city",
      "state",
      "country",
      "reference",
      "productService",
      "leadstatus",
      "leadType",
      "assignTo",
      "projectValue",
    ];

    if (leadCategory === "newLead") {
      if (!newCompanyName || newCompanyName.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "newCompanyName is required for new leads.",
        });
      }
    } else if (leadCategory === "prospect") {
      if (!Prospect) {
        return res.status(400).json({
          success: false,
          error: "Prospect is required for prospect leads.",
        });
      }
    } else if (leadCategory === "client") {
      if (!Client) {
        return res.status(400).json({
          success: false,
          error: "Client is required for client leads.",
        });
      }
    }

    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ success: false, error: `${field} is required.` });
      }
    }

    // Prepare lead data
    const leadData = {
      Prospect: leadCategory === "prospect" ? Prospect : undefined,
      Client: leadCategory === "client" ? Client : undefined,
      newCompanyName: leadCategory === "newLead" ? newCompanyName : undefined,
      companyName,
      // firstName,
      // middleName,
      // lastName,
      // gender,
      countryCode,
      companyId,
      phoneNo,
      altPhoneNo,
      email,
      altEmail,
      notes,
      address,
      pincode,
      city,
      state,
      country,
      reference,
      productService,
      leadstatus,
      leadType,
      projectValue,
      assignTo,
      contact,
      followups,
      leadCategory,
    };

    const newLead = new leadModel(leadData);
    const savedLead = await newLead.save();

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: savedLead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getLeadController = async (req, res) => {
  try {
    const { companyId } = req.query;
    const { empId } = req.params;

    console.log(empId);

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid companyId is required" });
    }

    // base filter
    let filter = { companyId: new mongoose.Types.ObjectId(companyId) };

    // empId param (optional)
    if (empId && mongoose.Types.ObjectId.isValid(empId)) {
      filter.assignTo = new mongoose.Types.ObjectId(empId);
    }

    const leads = await leadModel
      .find(filter)
      .populate("Prospect", "companyName")
      .populate("Client")
      .populate("reference", "LeadReference")
      .populate("productService", "productName")
      .populate("leadstatus")
      .populate("leadType", "LeadType")
      .populate(
        "assignTo",
        "basicDetails.firstName basicDetails.lastName basicDetails.email"
      );

    res.status(200).json({
      success: true,
      total: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getLeadControllerById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await leadModel
      .findById(id)
      .populate("Prospect", "companyName")
      .populate("reference", "LeadReference")
      .populate("productService", "productName")
      .populate("leadstatus", "LeadStatus") // <-- fixed field name
      .populate("leadType", "LeadType")
      .populate(
        "assignTo",
        "basicDetails.firstName basicDetails.lastName basicDetails.email"
      );

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get Lead Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// update lead data
const updateLeadController = async (req, res) => {
  try {
    const leadId = req.params.id;
    let updateData = { ...req.body };

    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ message: "Valid Lead ID is required" });
    }

    // Clean reference fields: remove or set to undefined if falsy or empty string.
    [
      "Prospect",
      "Client",
      "reference",
      "productService",
      "leadstatus",
      "leadType",
      "assignTo",
    ].forEach((key) => {
      if (
        updateData.hasOwnProperty(key) &&
        (!updateData[key] || updateData[key] === "")
      ) {
        updateData[key] = undefined;
      }
    });

    console.log("------------------------------------------", updateData);

    // Update only provided fields; $set ensures only changed fields are updated.
    const updatedLead = await leadModel
      .findByIdAndUpdate(
        leadId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .populate("Prospect", "companyName")
      .populate("Client", "companyName clientName")
      .populate("reference", "LeadReference")
      .populate("productService", "productName")
      .populate("leadstatus", "LeadStatus colorCode")
      .populate("leadType", "LeadType")
      .populate(
        "assignTo",
        "basicDetails.firstName basicDetails.lastName basicDetails.email"
      );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating lead",
      error: error.message,
    });
  }
};

const deleteLeadController = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await leadModel.findByIdAndDelete(id);

    if (!lead) {
      return res
        .status(404)
        .json({ status: false, message: "Error while deleting lead by id" });
    }

    return res
      .status(200)
      .json({ status: true, message: `Lead data deleted ${id}` });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting lead",
      error: error.message,
    });
  }
};

//todo: FollowUp controllers
// Create Follow-Up
// Add a follow-up to a lead
const createFollowUpController = async (req, res) => {
  const { leadId, followupDate, followupTime, leadstatus, comment } = req.body;

  try {
    const lead = await leadModel.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Always use 'leadstatus' as field name for consistency
    const newFollowUp = { followupDate, followupTime, leadstatus, comment };
    lead.followups.push(newFollowUp);
    await lead.save();

    res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      data: lead.followups,
    });
  } catch (error) {
    console.error("Error creating follow-up:", error);
    res.status(500).json({ message: "Failed to add follow-up" });
  }
};

// Get all follow-ups for all leads (flattened)
const getFollowUpController = async (req, res) => {
  try {
    const leads = await leadModel.find({}, "followups");
    const allFollowups = leads.flatMap((lead) =>
      (lead.followups || []).map((f) => ({
        ...f.toObject(),
        leadId: lead._id,
      }))
    );
    res.status(200).json({ success: true, data: allFollowups });
  } catch (err) {
    console.error("Error fetching follow-ups:", err);
    res.status(500).json({ message: "Failed to fetch follow-ups" });
  }
};

// Get follow-ups for a specific lead by leadId
const getFollowUpByLeadIdController = async (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = await leadModel.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({ success: true, data: lead.followups || [] });
  } catch (error) {
    console.error("Error fetching follow-ups by lead:", error);
    res.status(500).json({ message: "Failed to get follow-ups" });
  }
};

// Update a follow-up by its _id
const updateFollowUpController = async (req, res) => {
  const followUpId = req.params.id;
  const { followupDate, followupTime, leadstatus, comment } = req.body;

  try {
    const lead = await leadModel.findOne({ "followups._id": followUpId });
    if (!lead) return res.status(404).json({ message: "Follow-up not found" });

    const followUp = lead.followups.id(followUpId);
    if (!followUp)
      return res.status(404).json({ message: "Follow-up not found in array" });

    if (followupDate !== undefined) followUp.followupDate = followupDate;
    if (followupTime !== undefined) followUp.followupTime = followupTime;
    if (leadstatus !== undefined) followUp.leadstatus = leadstatus;
    if (comment !== undefined) followUp.comment = comment.trim();

    await lead.save();
    res
      .status(200)
      .json({ success: true, message: "Follow-up updated", data: followUp });
  } catch (err) {
    console.error("Error updating follow-up:", err);
    res.status(500).json({ message: "Failed to update follow-up" });
  }
};

// Delete a follow-up by its _id
const deleteFollowUpController = async (req, res) => {
  const followUpId = req.params.id;

  try {
    const lead = await leadModel.findOne({ "followups._id": followUpId });
    if (!lead) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    lead.followups = lead.followups.filter(
      (f) => f._id.toString() !== followUpId
    );
    await lead.save();

    res
      .status(200)
      .json({ success: true, message: "Follow-up deleted successfully" });
  } catch (err) {
    console.error("Error deleting follow-up:", err);
    res.status(500).json({ message: "Failed to delete follow-up" });
  }
};

module.exports = {
  createLeadController,
  getLeadController,
  updateLeadController,
  deleteLeadController,
  //:todo follow ups
  createFollowUpController,
  getFollowUpController,
  getFollowUpByLeadIdController,
  updateFollowUpController,
  deleteFollowUpController,
  getLeadControllerById,
};
