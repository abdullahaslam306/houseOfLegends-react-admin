let mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const orderStatus = {
  OPEN: "open",
  CLOSED: "closed"
};
let OrderSchema = new mongoose.Schema(
  {
    // perks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Perk'}],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date },
    quantityArray: {
      type: [
        {
          quantity: { type: Number },
          perk: { type: String } //slug of the perk
        }
      ],
      default: []
    },
    name: { type: String },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.OPEN
    },
    discord: { type: String },
    email: { type: String },
    walletAddress: { type: String },
    remarks: { type: String },
    supportTeamAssigned: { type: Boolean, default: false },

  },
  { timestamps: true }
);

OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", OrderSchema);
