const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userModel);
module.exports = User;
