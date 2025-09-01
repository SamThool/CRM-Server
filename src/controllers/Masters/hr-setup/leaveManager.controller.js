const { LeaveManagerModel } = require("../../../models/index");
const { statusModel } = require("../../../models/index");
const { leaveTypeModel } = require("../../../models/index");
const { Administrative } = require("../../../models/index");
const mongoose = require("mongoose");

// Create a new leave manager entry
const createLeaveManager = async (req, res) => {
  try {
    const { staffName, leaveType, status, noOfDays, reason } = req.body;

    // console.log("administrative", req.body);

    // ✅ Check required fields
    if (!staffName || !leaveType || !status || !noOfDays || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
  

    // ✅ Find leaveType by name (string match)
    const foundLeaveType = await leaveTypeModel.findOne({
      leaveType: leaveType,
    });
    if (!foundLeaveType) {
      return res.status(404).json({
        success: false,
        message: `Leave type "${leaveType}" not found.`,
      });
    }

    // ✅ Find status by name
    const foundStatus = await statusModel.findOne({ statusName: status });
    if (!foundStatus) {
      return res.status(404).json({
        success: false,
        message: `Status "${status}" not found.`,
      });
    }

    // ✅ Save leave entry with string values
    const newLeave = new LeaveManagerModel({
      staffName,
      leaveType: foundLeaveType.leaveType, // store as string
      status: foundStatus.statusName, // store as string
      noOfDays,
      reason,
    });

    const savedLeave = await newLeave.save();

    res.status(201).json({
      success: true,
      message: "Leave request created successfully.",
      data: savedLeave,
    });
  } catch (error) {
    console.error("Create Leave Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Fetch all leave managers
const getAllLeaveManagers = async (req, res) => {
  try {
    // ✅ Fetch only non-deleted records & populate leaveType and status
    const leaveRecords = await LeaveManagerModel.find({ delete: false }).sort({
      createdAt: -1,
    });

    if(!leaveRecords || leaveRecords.length === 0){
      return res.status(404).json({
        status : false,
        message : "Leave not found"
      })
    }

    // console.log("leave data:", leaveRecords);

    res.status(200).json({
      success: true,
      message: "All leave records fetched successfully.",
      count: leaveRecords.length,
      data: leaveRecords,
    });
  } catch (error) {
    console.error("Error in getAllLeaveManagers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching leave records.",
      error: error.message,
    });
  }
};

// Update a specific leave manager
const updateLeaveManager = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { staffName, leaveType, status, noOfDays, reason } = req.body;

    // ✅ Check required fields
    if (!staffName || !leaveType || !status || !noOfDays || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ✅ Check if leave record exists
    const existingLeave = await LeaveManagerModel.findById(leaveId);
    if (!existingLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave record not found.",
      });
    }

    // ✅ Find leaveType by name
    const foundLeaveType = await leaveTypeModel.findOne({
      leaveType: leaveType,
    });
    if (!foundLeaveType) {
      return res.status(404).json({
        success: false,
        message: `Leave type "${leaveType}" not found.`,
      });
    }

    // ✅ Find status by name
    const foundStatus = await statusModel.findOne({ statusName: status });
    if (!foundStatus) {
      return res.status(404).json({
        success: false,
        message: `Status "${status}" not found.`,
      });
    }

    // ✅ Update the leave record
    existingLeave.staffName = staffName;
    existingLeave.leaveType = foundLeaveType.leaveType;
    existingLeave.status = foundStatus.statusName;
    existingLeave.noOfDays = noOfDays;
    existingLeave.reason = reason;

    const updatedLeave = await existingLeave.save();

    res.status(200).json({
      success: true,
      message: "Leave request updated successfully.",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Update Leave Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Soft delete a specific leave manager
const deleteLeaveManager = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLeaveManager = await LeaveManagerModel.findByIdAndUpdate(
      id,
      { delete: true },
      { new: true }
    );

    if (!deletedLeaveManager) {
      return res
        .status(404)
        .json({ success: false, message: "Leave manager not found" });
    }

    res.status(200).json({
      success: true,
      message: "Leave manager deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting leave manager:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Export all controllers
module.exports = {
  createLeaveManager,
  getAllLeaveManagers,
  updateLeaveManager,
  deleteLeaveManager,
};
