const mongoose = require("mongoose");

const courseSequenceSchema = new mongoose.Schema({
    _id: String,
    seq: Number
});

module.exports = courseSequenceSchema;