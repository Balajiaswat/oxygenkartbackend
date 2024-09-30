const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String },
  payment: { type: Boolean, default: false },
  //   admin: { type: Boolean, default: false },
  google_auth: { type: Boolean, default: false },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
