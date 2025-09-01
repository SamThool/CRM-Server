const mongoose = require('mongoose')


const leadReferenceSchema = new mongoose.Schema({
    LeadReference: { type: String, required: true, },
}, {
    timestamps: true
})


const leadReferenceModel = mongoose.model("leadReference", leadReferenceSchema);
module.exports = leadReferenceModel;