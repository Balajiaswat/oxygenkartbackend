const express = require("express");
const notifiRoute = express.Router();
const {
  sendNotifi,
  updateNotifi,
  getAllNotifi,
  deleteNotifi,
  getLatestNotifi,
} = require("../controller/noti.controller");
const { auth } = require("../middleware/auth");

notifiRoute.use(express.json({ limit: "50mb" }));

notifiRoute.post("/add", auth, sendNotifi);
notifiRoute.put("/update/:id", auth, updateNotifi);
notifiRoute.get("/get", auth, getAllNotifi);
notifiRoute.get("/getlatest", auth, getLatestNotifi);
notifiRoute.delete("/delete/:id", auth, deleteNotifi);

module.exports = notifiRoute;
