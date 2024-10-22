const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Reference to User model
  loginDate: { type: Date, default: Date.now }, // Automatically set the timestamp
  login: { type: Boolean, required: true },
});

const Login = mongoose.model("Login", loginSchema);

module.exports = Login;
