const UserModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BlackListModel } = require("../model/blacklist");
require("dotenv").config();

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const isUserPresent = await UserModel.findOne({ email });
    if (isUserPresent)
      return res.status(401).send({ msg: "User already exist" });

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ username, email, password: hashPass });
    await newUser.save();

    res.status(200).send({ msg: "User registered success" });
  } catch (error) {
    res.status(503).send({ msg: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUserPresent = await UserModel.findOne({ email });

    if (!isUserPresent)
      return res.status(403).send({ msg: "Email or password is incorrect" });

    const isPasswordValid = await bcrypt.compare(
      password,
      isUserPresent.password
    );
    if (!isPasswordValid)
      return res.status(403).send({ msg: "Email or password is incorrect" });
    // Store user ID in session

    const token = await jwt.sign(
      {
        userId: isUserPresent._id,
      },
      process.env.SECRET_ACCESS_KEY
    );

    res.status(200).send({
      msg: "Login Success",
      token,
      user: {
        userId: isUserPresent._id,
        username: isUserPresent.username,
        user: isUserPresent,
      },
    });
  } catch (error) {
    res.status(503).send({ msg: "Server Error", error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format if necessary

    // Query user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { _id, name, email: userEmail } = user;

    // Send user data in response
    res.status(200).json({ _id, name, email: userEmail });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    // Validate newPassword and confirmPassword
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Adjust salt rounds as needed

    // Update user's password in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user data in response
    res.status(200).json({ msg: "password changed" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.userId;

    const getUser = await UserModel.findById({ _id: userId });

    res.status(200).send(getUser);
  } catch (error) {
    res.status(503).send(error.message);
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUser = await UserModel.find();
    if (allUser.length === 0)
      return res.status(401).send({ msg: "No User Found" });

    res.status(200).send(allUser);
  } catch (error) {
    res.status(503).send(error.message);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers?.authorization;
    if (!token) {
      return res.status(400).json({ msg: "Token is invalid or not provided" });
    }

    const blacklistToken = new BlackListModel({
      token: token,
    });

    await blacklistToken.save();

    res.status(200).json({ msg: "Logout success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getUserById,
  getAllUser,
  getUserByEmail,
  changePassword,
};
