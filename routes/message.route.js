const express = require("express");
const msgRouter = express.Router();
const {
  addMessage,
  getAllMessages,
  updateMessage,
  deleteMessage,
  getMessagesWithinTimeRange,
} = require("../controller/messageController");
const { auth } = require("../middleware/auth");

msgRouter.post("/add", auth, addMessage);
msgRouter.get("/get", getAllMessages);
msgRouter.get("/getwithtime", getMessagesWithinTimeRange);
msgRouter.put("/update/:id", auth, updateMessage);
msgRouter.delete("/delete/:id", auth, deleteMessage);

module.exports = msgRouter;
