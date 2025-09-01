const mongoose = require('mongoose')

const ticketStatusSchema = new mongoose.Schema({
    TicketStatus: { type: String, required: true, },
    shortForm: { type: String, required: true, },
    colorCode: { type: String, required: true, },
}, {
    timestamps: true
})


const ticketStatusModel = mongoose.model("ticketStatus", ticketStatusSchema);
module.exports = ticketStatusModel;