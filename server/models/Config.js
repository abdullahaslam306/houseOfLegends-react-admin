let mongoose = require("mongoose");

let ConfigSchema = new mongoose.Schema({
    days: {type: Number},
    gems: {type: Number}
}, {timestamps: true});

module.exports = mongoose.model("Config", ConfigSchema);