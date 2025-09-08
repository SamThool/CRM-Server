const { ClientRegistrationModel } = require("../../models/index");
const { SuperAdminModel } = require("../../models/index");
const { TypeOfClientModel } = require("../../models/index");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AdminModel } = require("../../models/index");
require("dotenv").config();

// get all client registration details
const getAllClientRegistration = async (req, res) => {
  try {
    const clientRegistration = await ClientRegistrationModel.find()
      .populate("clientType")
      .populate("contactPerson");

    if (!clientRegistration || clientRegistration.length === 0) {
      return res.status(404).json({ message: "Client registration not found" });
    }

    // sort data from newest to oldest
    clientRegistration.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // b is newer, a is older
    );

    return res.status(200).json({ status: "true", data: clientRegistration });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createClientRegistration = async (req, res) => {
  try {
    const {
      clientName,
      officialPhoneNo,
      altPhoneNo,
      officialMailId,
      altMailId,
      emergencyContactPerson,
      emergencyContactNo,
      website,
      gstNo,
      panNo,
      officeAddress,
      pincode,
      city,
      state,
      country,
      clientType,
      startDate,
      endDate,
      contactPerson,
    } = req.body;

    // Handle uploaded logo
    const logo = req.file ? `/images/${req.file.filename}` : null;

    // 🔍 Basic validation for required fields
    const requiredFields = [
      clientName,
      officialPhoneNo,
      officialMailId,
      emergencyContactPerson,
      emergencyContactNo,
      website,
      gstNo,
      panNo,
      officeAddress,
      pincode,
      city,
      state,
      country,
    ];

    if (requiredFields.some((field) => !field || field.trim() === "")) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    // 📦 Validate pincode using external API
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const pinData = response?.data?.[0];

    if (
      !pinData ||
      pinData.Status !== "Success" ||
      !pinData.PostOffice?.length
    ) {
      return res.status(400).json({ message: "Invalid Pincode" });
    }

    const postOfficeInfo = pinData.PostOffice[0];
    const validatedCity = postOfficeInfo.District;
    const validatedState = postOfficeInfo.State;
    const validatedCountry = postOfficeInfo.Country;

    // 🔍 Cross-check location
    if (
      city.toLowerCase() !== validatedCity.toLowerCase() ||
      state.toLowerCase() !== validatedState.toLowerCase() ||
      country.toLowerCase() !== validatedCountry.toLowerCase()
    ) {
      return res.status(400).json({
        message: "City/State/Country doesn't match the pincode.",
        expected: {
          city: validatedCity,
          state: validatedState,
          country: validatedCountry,
        },
      });
    }

    // 🔎 Validate clientType ObjectId exists
    const typeOfClientDoc = await TypeOfClientModel.findById(clientType);
    if (!typeOfClientDoc) {
      return res.status(404).json({ message: "Type of client not found." });
    }

    // 👤 Structure nested contact person object
    // const contactPerson = {
    //   name: contactPerson_name ?? "",
    //   department: contactPerson_department ?? "",
    //   position: contactPerson_position ?? "",
    //   email: contactPerson_email ?? "",
    //   phone: contactPerson_phone ?? ""
    // };

    // 📝 Create new client document
    const newClientRegistration = new ClientRegistrationModel({
      clientName,
      officialPhoneNo,
      altPhoneNo: altPhoneNo ?? "",
      officialMailId,
      altMailId: altMailId ?? "",
      emergencyContactPerson,
      emergencyContactNo,
      website,
      gstNo,
      panNo,
      logo,
      officeAddress,
      pincode,
      city,
      state,
      country,
      clientType,
      startDate,
      endDate,
      contactPerson: contactPerson?.map((person) => ({
        name: person?.name ?? "",
        department: person?.department ?? "",
        position: person?.position ?? "",
        email: person?.email ?? "",
        phone: person?.phone ?? "",
      })),
    });

    await newClientRegistration.save();
    // Save client credentials in AdminModel
    const hashedPassword = await bcrypt.hash(officialPhoneNo, 10);
    const newAdmin = new AdminModel({
      name: clientName,
      email: officialMailId,
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
      refId: newClientRegistration._id,
      refType: "clientRegistration",
    });
    await newAdmin.save();

    console.log("New client registration created:", newAdmin);

    return res.status(201).json({
      status: true,
      message: "Client registered successfully",
      data: newClientRegistration,
    });
  } catch (error) {
    console.error("Error in createClientRegistration:", error);
    return res.status(500).json({
      message: "Server error while registering client.",
      error: error.message,
    });
  }
};

// client login
const clientLogin = async (req, res) => {
  try {
    const values = req.body;
    const officialMailId = values.email;
    const officialPhoneNo = values.password;
    if (!officialMailId || !officialPhoneNo) {
      return res
        .status(400)
        .json({ message: "Email and phone number required" });
    }

    const client = await ClientRegistrationModel.findOne({ officialMailId });
    if (!client) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (client.officialPhoneNo !== officialPhoneNo) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Optionally, generate a JWT token here for session management
    const token = jwt.sign(
      { id: client._id, email: client.officialMailId },
      // "Bearar"
      process.env.JWT_SECRET
    );

    res.cookie("hmsToken", token, {
      httpOnly: false, // set to true if you want to prevent JS access
      secure: false, // set to true in production with HTTPS
      sameSite: "Lax", // or 'Strict'/'None' depending on your app
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      status: "true",
      message: "Login successful",
      token, // Uncomment if using JWT
      role: client.role,
      client,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in" });
  }
};

const updateClientRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      officialPhoneNo,
      altPhoneNo,
      officialMailId,
      altMailId,
      emergencyContactPerson,
      emergencyContactNo,
      website,
      gstNo,
      panNo,
      logo,
      officeAddress,
      pincode,
      city,
      state,
      country,
      clientType,
      startDate,
      endDate,
      contactPerson,
      locations,
    } = req.body;

    const updatedClientRegistration =
      await ClientRegistrationModel.findByIdAndUpdate(
        id,
        {
          clientName,
          officialPhoneNo,
          altPhoneNo,
          officialMailId,
          altMailId,
          emergencyContactPerson,
          emergencyContactNo,
          website,
          gstNo,
          panNo,
          logo,
          officeAddress,
          pincode,
          city,
          state,
          country,
          clientType,
          startDate,
          endDate,
          contactPerson: contactPerson?.map((person) => ({
            name: person?.name ?? "",
            department: person?.department ?? "",
            position: person?.position ?? "",
            email: person?.email ?? "",
            phone: person?.phone ?? "",
          })),
          locations: {
            exportCenter: Array.isArray(locations?.exportCenter)
              ? locations.exportCenter
              : [],
            factories: Array.isArray(locations?.factories)
              ? locations.factories
              : [],
            warehouse: Array.isArray(locations?.warehouse)
              ? locations.warehouse
              : [],
            branches: Array.isArray(locations?.branches)
              ? locations.branches
              : [],
          },
        },
        { new: true, runValidators: true }
      );
    const superAdmin = await SuperAdminModel.findById(id);
    console.log("Super Admin:", superAdmin);
    if (superAdmin) {
      const hashedPassword = await bcrypt.hash(officialPhoneNo, 10);
      const updatedAdmin = await AdminModel.findOneAndUpdate(
        { refId: id, refType: "clientRegistration" },
        {
          name: clientName,
          email: officialMailId,
          password: hashedPassword,
          role: "admin",
          isBlocked: false,
        },
        { new: true, runValidators: true }
      );
      await updatedAdmin.save();
      console.log("Updated Admin:", updatedAdmin);
    }
    res.status(200).json({
      success: true,
      message: "Client registration updated successfully",
      data: updatedClientRegistration,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update client registration",
      error: error.message,
    });
  }
};

// delete client registration
const deleteClientRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClientRegistration =
      await ClientRegistrationModel.findByIdAndDelete(id);

    if (!deletedClientRegistration) {
      return res.status(404).json({ message: "Client registration not found" });
    }
    // Optionally, delete the associated admin user
    await AdminModel.deleteOne({ refId: id, refType: "clientRegistration" });

    return res
      .status(200)
      .json({ status: "true", message: "Client registration deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error deleting client registration" });
  }
};

// get client registration by id
const getClientRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientRegistration = await ClientRegistrationModel.findById(id)
      .populate("locations.exportCenter")
      .populate("locations.factories")
      .populate("locations.warehouse")
      .populate("locations.branches");

    if (!clientRegistration) {
      return res.status(404).json({ message: "Client registration not found" });
    }

    return res.status(200).json({ status: "true", data: clientRegistration });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching client registration" });
  }
};

module.exports = {
  getAllClientRegistration,
  createClientRegistration,
  clientLogin,
  updateClientRegistration,
  deleteClientRegistration,
  getClientRegistrationById,
};
