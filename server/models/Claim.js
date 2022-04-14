let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let uniqueValidator = require("mongoose-unique-validator");

let ClaimSchema = new mongoose.Schema({
    walletAddress: {type: String, unique: true},
    gems: {type: Number},
    usedGems: {type: Number, default: 0},
}, {timestamps: true});

ClaimSchema.plugin(mongoosePaginate);
ClaimSchema.plugin(uniqueValidator, { message: "is already taken." });

module.exports = mongoose.model("Claim", ClaimSchema);