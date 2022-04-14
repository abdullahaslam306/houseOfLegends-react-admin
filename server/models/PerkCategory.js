let mongoose = require("mongoose");

let PerkCategorySchema = new mongoose.Schema({
    Perk: {type: mongoose.Schema.Types.ObjectId, ref: 'Perk'},
    Category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
}, {timestamps: true});

module.exports = mongoose.model("PerkCategory", PerkCategorySchema);