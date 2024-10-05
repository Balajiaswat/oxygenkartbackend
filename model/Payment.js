const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const PaymentModel = mongoose.model("payment", paymentSchema);

module.exports = PaymentModel;
