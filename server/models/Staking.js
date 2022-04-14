let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

let StakingSchema = new mongoose.Schema({
    asset: {type: String},
    startDate: {type: Date},
    endDate: {type: Date, default: null},
    gems: {type: Number, default: 0},
    type: {
        type: Number,
        enum: [
            1,  //Normal Staking
            2,  //One Time Staking
        ],
        default: 1
    }, 
}, {timestamps: true});

StakingSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

StakingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Staking", StakingSchema);