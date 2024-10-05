const express = require("express");
const connecttion = require("./config/DB");
const userRoute = require("./routes/user.routes");
const msgRouter = require("./routes/message.route");
const cors = require("cors");
const courseRoute = require("./routes/course.route");
const notifiRoute = require("./routes/notification.routes");
const courseOrderRoute = require("./routes/courseOrder.routes");
const contactUsRoute = require("./routes/contact.routes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(cors());
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://admin.oxygenkart.com",
//       "https://oxygenkart.com",
//     ],
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );
app.use(express.json());

app.get("/", (req, res) => {
  try {
    res.status(503).send("Hello from server !!");
  } catch (error) {
    res.status(503).send({ msg: error.message });
  }
});

app.use("/user", userRoute);
app.use("/message", msgRouter);
app.use("/course", courseRoute);
app.use("/notification", notifiRoute);
app.use("/courseOrder", courseOrderRoute);
app.use("/contactus", contactUsRoute);
app.use("/payment", paymentRoutes);

app.listen(8080, async () => {
  try {
    await connecttion;
    console.log("DB is connected");
  } catch (error) {
    console.log(error.message);
  }
  console.log("Server is running ");
});
