const express = require("express");
const courseOrderRoute = express.Router();
const {
  buyOrder,
  getOrdersByUser,
  deleteOrder,
  courseVerifyPayment,
} = require("../controller/courseOrder.controller");
const { auth } = require("../middleware/auth");

courseOrderRoute.post("/buy/:courseId", auth, buyOrder);
courseOrderRoute.post("/courseVerifyPayment", auth, courseVerifyPayment);
courseOrderRoute.get("/get", auth, getOrdersByUser);
courseOrderRoute.delete("/delete/:orderId", auth, deleteOrder);

module.exports = courseOrderRoute;
