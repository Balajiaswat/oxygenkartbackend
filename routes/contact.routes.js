const express = require("express");
const contactUsRoute = express.Router();
const {
  addContact,
  getAllContacts,
} = require("../controller/contact.controller"); // Adjust the path as necessary
const { auth } = require("../middleware/auth");

contactUsRoute.post("/send", addContact);
contactUsRoute.get("/get", auth, getAllContacts);

module.exports = contactUsRoute;
