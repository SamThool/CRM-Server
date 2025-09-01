const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})

const departmentModel = mongoose.model("department", departmentSchema);
module.exports = departmentModel;