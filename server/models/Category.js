let mongoose = require("mongoose");

let CategorySchema = new mongoose.Schema({
    description: {type: String},
}, {timestamps: true});

module.exports = mongoose.model("Category", CategorySchema);