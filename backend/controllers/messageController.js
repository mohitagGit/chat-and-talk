const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { message, groupId } = req.body;

  if (!message || !groupId) {
    return res.status(400).json({ error: "Required parameter are missing." });
  }

  const chatInfo = await Chat.findOne({
    _id: groupId,
    members: { $elemMatch: { $eq: req.user._id } },
  });

  console.log("Chat infor", chatInfo);
  if (!chatInfo) {
    return res.status(404).json({ error: "Invalid chat." });
  }

  const newMessagePayload = {
    message: message,
    sender: req.user._id,
    chatId: chatInfo._id,
  };

  try {
    const newMessage = await Message.create(newMessagePayload);
    console.log("New message", newMessage);
    const messageInfo = await Message.findById(newMessage._id).populate(
      "sender",
      "-password"
    );
    console.log("Full message", messageInfo);

    res.status(201).json({
      message: `Message sent successfully.`,
      data: messageInfo,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const getAllMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const chatInfo = await Chat.findOne({
    _id: groupId,
    members: { $elemMatch: { $eq: req.user._id } },
  });

  console.log("Chat infor", chatInfo);
  if (!chatInfo) {
    return res.status(404).json({ error: "Invalid chat." });
  }

  const chatData = await Chat.findById(
    chatInfo._id,
    "_id chatName isGroup"
  ).populate("members", "_id name email");
  try {
    Message.find({
      chatId: groupId,
    })
      .populate("sender", "id name")
      .then(async (messages) => {
        res.status(200).send({
          message: `${messages.length} message(s) found in chat with ${chatInfo.chatName}`,
          data: messages,
          chat: chatData,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error });
  }
});

module.exports = {
  sendMessage,
  getAllMessages,
};
