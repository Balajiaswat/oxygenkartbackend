const mongoose = require("mongoose");
require("dotenv").config();

const connecttion = mongoose.connect(
  "mongodb+srv://balajiaswat:KIL1aUQmviUYNvjI@oxygenkartcluster.6pztc.mongodb.net/oxygenData?retryWrites=true&w=majority&appName=OxygenKartCluster"
);

module.exports = connecttion;
