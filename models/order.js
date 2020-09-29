const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = model("Order", orderSchema);
