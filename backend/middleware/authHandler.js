const jwtToken = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authUserCheck = asyncHandler(async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied." });
  }

  try {
    const decodedToken = jwtToken.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedToken.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid session, please login" });
  }
});

module.exports = authUserCheck;
