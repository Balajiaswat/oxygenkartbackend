const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    // title: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const messageModel = mongoose.model("message", messageSchema);
module.exports = messageModel;
