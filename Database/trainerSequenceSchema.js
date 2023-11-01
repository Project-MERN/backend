const mongoose = require("mongoose");

const trainerSequenceSchema = new mongoose.Schema({
    _id: String,
    seq: Number
});

module.exports = trainerSequenceSchema;