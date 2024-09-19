const jwt = require("jsonwebtoken");

const jwtToken = (userData) => {
  return jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = jwtToken;
