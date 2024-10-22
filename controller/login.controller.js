const Login = require("../model/loginUser");

const loginUser = async (req, res) => {
  const { userId } = req.params; // Get the userId from the request params

  try {
    // Create a new login record
    const newLogin = new Login({
      userId, // Store the userId
      login: true,
    });

    // Save the login record to the database
    await newLogin.save();

    res
      .status(201)
      .json({ message: "Login recorded successfully", login: newLogin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record login", error: error.message });
  }
};

const getLoginUser = async (req, res) => {
  const { year, month } = req.query; // Get year and month from query params

  try {
    // Create a start date for the query (start of the specified year and month)
    const startDate = new Date(year, month ? month - 1 : 0, 1); // If month is specified, subtract 1 since months are 0-indexed in JS

    // Create an end date for the query (start of the next month/year)
    const endDate = month
      ? new Date(year, month, 1) // Start of the next month
      : new Date(parseInt(year) + 1, 0, 1); // Start of the next year if no month is specified

    // Prepare the query for fetching logins between startDate and endDate
    const query = {
      loginDate: {
        $gte: startDate,
        $lt: endDate,
      },
    };

    // Fetch all logged-in users based on the specified year and month
    const allUser = await Login.find(query);

    const userCount = allUser.length; // Count the number of users
    res
      .status(200)
      .json({ msg: "User logins fetched successfully", userCount });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch user logins",
      error: error.message,
    });
  }
};

module.exports = { loginUser, getLoginUser };
