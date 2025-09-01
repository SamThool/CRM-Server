const mongoose = require('mongoose')


const leadTypeSchema = new mongoose.Schema({
    LeadType: { type: String, required: true, },
}, {
    timestamps: true
})


const leadTypeModel = mongoose.model("leadType", leadTypeSchema);
module.exports = leadTypeModel;