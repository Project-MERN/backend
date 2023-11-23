const mongoose = require("mongoose");

const newCourseSchema = new mongoose.Schema({
    id: String,
    name: String,
    tittle: String,
    description: String,
    duration: String,
});

module.exports = newCourseSchema;