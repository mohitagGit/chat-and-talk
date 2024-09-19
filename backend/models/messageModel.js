const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    message: { type: String, trim: true, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    receivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;
