const nodemailer = require("nodemailer");
const ContactUs = require("../model/Contact");

// Function to send email
const sendContactUsMail = async (firstName, lastName, email, message) => {
  try {
    // Create transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "instalingual@gmail.com",
        pass: "cmklfchsavcpctkj",
      },
    });

    // Define the email options
    const mailOptions = {
      from: email, // sender address (must be your Gmail address)
      to: "uddinshahbaz156@gmail.com",
      subject: "Contact Us Form Submission",
      text:
        `You have received a new message from your website contact form.\n\n` +
        `Here are the details:\n\n` +
        `First Name: ${firstName}\n\n` +
        `Last Name: ${lastName}\n\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find();
    if (contacts.length === 0)
      return res.status(400).send({ msg: "No contacts available" });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    res.status(500).send("Something went wrong, please try again");
  }
};

// Function to handle contact form submission
const addContact = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).send({ msg: "All fields are required" });
  }

  try {
    // Save contact form details to the database
    const newContactUs = new ContactUs({
      firstName,
      lastName,
      email,
      message,
    });

    await newContactUs.save();

    // Send the email
    await sendContactUsMail(firstName, lastName, email, message);

    res.status(201).send("Your message has been sent successfully!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong, please try again");
  }
};

module.exports = { addContact, getAllContacts };
