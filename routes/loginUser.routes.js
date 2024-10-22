const express = require("express");
const loginRoute = express.Router();
const { auth } = require("../middleware/auth");
const { loginUser, getLoginUser } = require("../controller/login.controller");

loginRoute.post("/user-login/:userId", auth, loginUser);
loginRoute.get("/get", getLoginUser);

module.exports = loginRoute;
