const mongoose = require('mongoose')

const leadStatusSchema = new mongoose.Schema({
    LeadStatus: { type: String, required: true, },
    shortForm: { type: String, required: true, },
    colorCode: { type: String, required: true, },
}, {
    timestamps: true
})


const leadStatusModel = mongoose.model("leadStatus", leadStatusSchema);
module.exports = leadStatusModel;