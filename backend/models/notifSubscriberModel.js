const mongoose = require("mongoose");

const notifSubscriberModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a User model
      ref: "User",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true, // Each subscription must be unique
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    deviceInfo: {
      browser: { type: String, required: true }, // e.g., Chrome, Firefox
      os: { type: String, required: false }, // e.g., Windows, macOS, Android
      deviceType: { type: String, required: false }, // e.g., desktop, mobile
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", notifSubscriberModel);

module.exports = Subscriber;
