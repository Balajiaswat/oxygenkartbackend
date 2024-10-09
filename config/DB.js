const mongoose = require("mongoose");
require("dotenv").config();

const connecttion = mongoose.connect(process.env.URL);

module.exports = connecttion;
