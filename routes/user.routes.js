const express = require("express");
const userRoute = express.Router();
const {
  register,
  login,
  logout,
  getUserById,
  getAllUser,
  getUserByEmail,
  changePassword,
  googleAuthLogin,
} = require("../controller/userController");
const { auth } = require("../middleware/auth");

userRoute.post("/register", register);
userRoute.post("/login", login);
userRoute.post("/google-auth", googleAuthLogin);
userRoute.get("/logout", auth, logout);
userRoute.get("/getuser", auth, getUserById);
userRoute.get("/getalluser", auth, getAllUser);
userRoute.post("/getuserbyemail", getUserByEmail);
userRoute.put("/change-password/:id", changePassword);

module.exports = userRoute;
