const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const User = require("../models/User.js");

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.studentSignup = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobileNumber,
      dateOfBirth,
      standard,
      schoolName,
      city,
    } = req.body;

    //Validate the required fields
    if (
      !firstName ||
      !lastName ||
      !middleName ||
      !email ||
      !password ||
      !mobileNumber ||
      !dateOfBirth ||
      !standard ||
      !schoolName ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Some fields are missing in the request body for signup",
      });
    }

    //Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format for signup",
      });
    }

    // check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const formattedDateOfBirth = new Date(dateOfBirth);
    
    // Create the user
    const newUser = await User.create({
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobileNumber,
      dateOfBirth: formattedDateOfBirth,
      standard,
      schoolName,
      city,
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      newUser: userResponse,
      message: "User created successfully.",
    });
  } catch (error) {
    console.log("Error while signing up student: ", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validate the required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Some fields are missing in the request body for login",
      });
    }

    //Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format for login",
      });
    }

    // check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User with this email does not exist, Please create a new account.",
      });
    }

    // Compare the password
    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate the JWT token
    const token = jwt.sign(
      {
        userId: existingUser._id.toString(),
        email: existingUser.email,
        name: existingUser.firstName + " " + existingUser.lastName,
        role: existingUser.isAdmin ? "admin" : "student",
      },
      config.jwtSecret,
    );

    // Remove the password from the user object
    const userResponse = existingUser.toObject();
    delete userResponse.password;

    // Send the token as a cookie and corresponding user details
    res
      .cookie("Bearer", token, {
        httpOnly: true,
        sameSite: "strict",
      })
      .status(200)
      .json({
        message:
          "LoggedIn Successfully. Here's the Cookie Token and Existing User :)",
        success: true,
        token,
        user: userResponse,
      });
  } catch (error) {
    console.log("Error while logging in student: ", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
