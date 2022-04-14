let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

let OrderAssetSchema = new mongoose.Schema({
    order: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
    address: {type: String},
    gems: {type: Number}
}, {timestamps: true});

OrderAssetSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("OrderAsset", OrderAssetSchema);