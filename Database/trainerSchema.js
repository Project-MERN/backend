const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    course: [String],

})

module.exports = trainerSchema;