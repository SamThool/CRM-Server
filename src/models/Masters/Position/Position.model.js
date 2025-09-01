const mongoose = require('mongoose')


const positionSchema = new mongoose.Schema({
    position: { type: String, required: true }
}, {
    timestamps: true
})


const positionModel = mongoose.model('position', positionSchema);

module.exports = positionModel; 