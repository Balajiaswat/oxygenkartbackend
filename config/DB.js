const mongoose = require("mongoose");
require("dotenv").config();

const connecttion = mongoose.connect(
  "mongodb+srv://jackayron5:9931797391@cluster0.rmylanp.mongodb.net/data?retryWrites=true&w=majority&appName=Cluster0"
);

module.exports = connecttion;
