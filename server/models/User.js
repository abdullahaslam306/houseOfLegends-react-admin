let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let uniqueValidator = require("mongoose-unique-validator");

let UserSchema = new mongoose.Schema({
    walletAddress: {type: String, unique: true},
    nonce: {type: Number, default: Math.floor(Math.random() * 1000000)}
}, {timestamps: true});

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(uniqueValidator, { message: "is already taken." });
module.exports = mongoose.model("User", UserSchema);