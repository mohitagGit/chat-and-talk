const mongoose = require("mongoose");

const userProfileModel = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    avatar: { type: String, required: false },
    bio: { type: String, trim: true, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileModel);
module.exports = UserProfile;
