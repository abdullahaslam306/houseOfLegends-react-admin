let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

let OrderSchema = new mongoose.Schema({
    // perks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Perk'}],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date},
    quantityArray: {type:[{
        quantity: {type: Number},
        perk: {type: String} //slug of the perk
    }], default:[]},
    name: {type: String},
    discord: {type: String},
    email: {type: String},
    walletAddress: {type: String},
    remarks: {type: String},
}, {timestamps: true});

OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", OrderSchema);