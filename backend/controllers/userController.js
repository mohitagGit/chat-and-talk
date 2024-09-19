const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwtToken = require("../config/jwtToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profile_pic } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    debugger;
    return res.status(400).json({ error: "User email already exist." });
  }

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    profile_pic,
  });

  if (newUser) {
    res.status(201).json({
      message: "User registered successfully.",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: jwtToken(newUser),
      },
    });
  } else {
    return res.status(400).json({ error: "Failed to create account" });
  }
});

const signInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isPassMatch = await bcrypt.compare(password, user.password);
  if (isPassMatch) {
    res.status(200).json({
      message: "User loggedin successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: jwtToken(user),
      },
    });
  } else {
    return res.status(401).json({ error: "Invalid username or password" });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  const searchKeyword = req.query.query;

  // if (searchKeyword.length < 3) {
  //   return res
  //     .status(400)
  //     .json({ error: "Minimum 3 characters are required for search." });
  // }

  const searchQuery = {
    $or: [
      { name: { $regex: searchKeyword, $options: "i" } },
      { email: { $regex: searchKeyword, $options: "i" } },
    ],
  };
  console.log(searchKeyword);
  console.log(searchQuery);
  const users = await User.find(searchQuery)
    .find({ _id: { $ne: req.user.id } })
    .sort({ name: 1 })
    .select("-password");
  res.status(200).json({
    message: `${users.length} user(s) found`,
    data: users,
  });
});

const signOutUser = asyncHandler(async (req, res) => {
  const current_user = req.user;
  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { registerUser, signInUser, signOutUser, searchUsers };
