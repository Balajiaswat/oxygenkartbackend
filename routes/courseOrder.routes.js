const express = require("express");
const courseOrderRoute = express.Router();
const {
  buyOrder,
  getOrdersByUser,
  deleteOrder,
} = require("../controller/courseOrder.controller");
const { auth } = require("../middleware/auth");

courseOrderRoute.post("/buy/:courseId", auth, buyOrder);
courseOrderRoute.get("/get", auth, getOrdersByUser);
courseOrderRoute.delete("/delete/:orderId", auth, deleteOrder);

module.exports = courseOrderRoute;
