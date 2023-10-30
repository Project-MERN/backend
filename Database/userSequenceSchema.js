const mongoose = require("mongoose");

const userSequenceSchema = new mongoose.Schema({
    _id: String,
    seq: Number
});

module.exports = userSequenceSchema;