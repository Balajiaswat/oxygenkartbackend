const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  message: { type: String, require: true },
});

const NotificationModel = mongoose.model("Noti", notificationSchema);

module.exports = NotificationModel;
