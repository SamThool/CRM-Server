// const { companyModel } = require('../../models/index')
const { contactModel } = require("../../models/index");
const { departmentModel } = require("../../models/index");


//todo: new data controller for contact
// const createContact = async (req, res) => {
//   try {
//     const newContact = new contactModel(req.body);
//     let savedContact = await newContact.save();

//     // Populate only department name
//     savedContact = await savedContact.populate('department');

//     // Convert to plain JS object and overwrite department field with just name
//     const plainContact = savedContact.toObject();
//     plainContact.department = savedContact.department?.name || null;

//     res.status(201).json({ status: "true", data: plainContact });
//   } catch (err) {
//     res.status(400).json({ status: "false", error: err.message });
//   }
// };

//! old get contact controller
// const getContacts = async (req, res) => {
//   try {
//     const contacts = await contactModel.find();

//     if (!contacts || contacts.length === 0) {
//       return res.status(404).json({ message: "Contacts not found" });
//     }

//     res.status(200).json({ status: "true", data: contacts });
//   } catch {
//     res.status(500).json({ status: "false", error: err.message });
//   }
// };

//todo: new get contact controller
// const getContacts = async (req, res) => {
//   try {
//     const contacts = await contactModel.find().populate('department');
//     const formatted = contacts.map(c => {
//       const obj = c.toObject();
//       obj.department = c.department?.name || null;
//       return obj;
//     });

//     res.status(200).json({message : "geting contact data", data : formatted});
//   } catch (error) {
//     res.status(500).json({ status: "false", message: "Failed to get contacts" });
//   }
// };

// get contact by id

// const getContactById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const contact = await contactModel.findById(id).populate('department');;

//     if (!contact) {
//       return res.status(404).json({
//         status: "false",
//         message: "Contact Id not found",
//       });
//     }

//     res.status(200).json({ message: "Contact Id found.", data: contact });
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ status: "false", message: "Contacts, error from the server" });
//   }
// };

//! old update the contact controller
// const updateContact = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const contact = req.body;

//     const updatedContact = await contactModel.findByIdAndUpdate(id, contact, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedContact) {
//       return res
//         .status(404)
//         .json({ status: "false", message: "contact not updated" });
//     }

//     // save data
//     await updatedContact.save();

//     console.log("updated data", updatedContact);
//     res.status(200).json({
//       status: "true",
//       message: "cantact updated successfully",
//       data: updatedContact,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "false",
//       message: ["Error Updating Department", error.message],
//     });
//   }
// };

//todo: new updated data controller
// const updateContact = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let updatedContact = await contactModel.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true, runValidators: true }
//     ).populate('department');

//     if (!updatedContact) {
//       return res.status(404).json({ status: "false", message: "Contact not found" });
//     }

//     const plainContact = updatedContact.toObject();
//     plainContact.department = updatedContact.department?.name || null;

//     res.status(200).json({
//       status: "true",
//       message: "Contact updated successfully",
//       data: plainContact,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "false",
//       message: ["Error updating contact", error.message],
//     });
//   }
// };

// delete contact by id
// const deleteContact = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedData = await contactModel.findByIdAndDelete(id);

//     if (!deletedData) {
//       return res
//         .status(404)
//         .json({ status: "false", message: "contact not found for delete" });
//     }

//     res.status(200).json({ status: "true", message: "Contact deleted by id" });
//   } catch (error) {
//     res.status(500).json({
//       status: "false",
//       message: ["Error Updating Department", error.message],
//     });
//   }
// };

// updated data
// GET ALL CONTACTS
const getContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find().lean().sort({ createdAt: -1 });

    // Optional: Attach full department data (from separate model)
    const departments = await departmentModel.find().sort({ createdAt: -1 });
    const enriched = contacts.map((c) => {
      const dept = departments.find((d) => d.department === c.department);
      return {
        ...c,
        departmentDetails: dept || null,
      };
    });

    return res
      .status(200)
      .json({ message: "Contacts fetched", data: enriched });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE CONTACT
const createContact = async (req, res) => {
  try {
    const { companyName, name, email, designation, phone, department } =
      req.body;

    // 🔍 Lookup department by name
    const dept = await departmentModel.findOne({ department });

    if (!dept) {
      return res.status(400).json({ message: "Invalid department name" });
    }

    const newContact = new contactModel({
      companyName,
      name,
      email,
      designation,
      phone,
      department: dept.department, // Store actual department name
    });

    await newContact.save();
    res.status(201).json({ status : true, message: "Contact created", data: newContact });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET CONTACT BY ID
// const getContactById = async (req, res) => {
//   try {
//     const { id } = req.params

//     const contact = await contactModel.findById(id)

//     if(!contact){
//         return res.status(404).json({status : "false", message : "contact id not found"})
//     }

//     res.status(200).json({status : "true", message : "contact id retived", data : contact})
//   } catch (error) {
//     console.error("Error fetching contacts:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the contact by ID, set to top

    // show in the top not bottom
    const contact = await contactModel.findById(id).sort({ createdAt: -1 });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // sort data from newest to oldest
    // contact.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 2. Fetch the full department object using department name
    const dept = await departmentModel.findOne({
      department: contact.department,
    });

    // 3. Attach full department details if found
    contact.departmentDetails = dept || null;

    res.status(200).json({ status : true, message: "Contact fetched", data: contact });
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// UPDATE CONTACT
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, name, email, designation, phone, department } =
      req.body;

       // Log incoming data for debugging
    console.log('Update Contact:', { id, companyName, name, email, designation, phone, department });


    // 🔍 Lookup department by name
    const dept = await departmentModel.findOne({ department });

    if (!dept) {
      return res.status(400).json({ message: "Invalid department name" });
    }

    // Log before update
    const exists = await contactModel.findById(id);
    if (!exists) {
      console.log('Contact not found for update:', id);
      return res.status(404).json({ message: "Contact not found" });
    }

    const updated = await contactModel.findByIdAndUpdate(
      id,
      {
        companyName,
        name,
        email,
        designation,
        phone,
        department: dept.department,
      },
      { new: true }
    );

    // if (!updated) {
    //   return res.status(404).json({ message: "Contact not found" });
    // }

    res.status(200).json({ status: true, message: "Contact updated", data: updated });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE CONTACT
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await contactModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
};
