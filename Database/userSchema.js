const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    recentlyViewd: [String],
    cart: [String],
    enrolled: [String],
    
})

module.exports = userSchema;