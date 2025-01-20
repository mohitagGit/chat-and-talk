const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { populate } = require("dotenv");

const createChat = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ error: "Recipient id is required." });
  }

  const recipientUser = await User.findById(recipientId);
  if (!recipientUser) {
    return res.status(400).json({ error: "Invalid recipient." });
  }

  const existingChat = await Chat.find({
    isGroup: false,
    $and: [
      { members: { $elemMatch: { $eq: recipientId } } },
      { members: { $elemMatch: { $eq: req.user._id } } },
    ],
  })
    .populate("members", "-password")
    .populate("lastMessage");

  const chatWithLastMessageUserInfo = await User.populate(existingChat, {
    path: "lastMessage.user",
    select: "_id name",
  });

  if (chatWithLastMessageUserInfo.length) {
    return res.status(200).json({
      message: `Chat with ${recipientUser.name} already exist.`,
      data: chatWithLastMessageUserInfo[0],
    });
  } else {
    const newChatPayload = {
      chatName: "OTO",
      isGroup: false,
      members: [req.user._id, recipientId],
      createdBy: req.user._id,
    };

    try {
      const newChat = await Chat.create(newChatPayload);
      const chatInfo = await Chat.findById(newChat._id).populate(
        "members",
        "-password"
      );

      res.status(201).json({
        message: `Chat with ${recipientUser.name} initiated successfully.`,
        data: chatInfo,
      });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
});

const getSingleChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  try {
    const chatInfo = await Chat.findOne({
      _id: chatId,
      members: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("members", "_id name email")
      .populate("admin", "_id name email");
    return res.status(200).send(chatInfo);
  } catch (error) {
    return res.status(404).json({ error: error });
  }
});

const getChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      members: { $elemMatch: { $eq: req.user._id } },
    })
      .populate({ path: "members", select: "_id name" })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "_id name" },
        select: "_id message updatedAt",
      })
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        res.status(200).send({
          message: `${results.length} chat(s) found`,
          data: results,
        });
      });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;

  if (!name || !members.length) {
    return res
      .status(400)
      .json({ error: "Group name and members are required." });
  }

  if (members.length < 1) {
    return res
      .status(400)
      .json({ error: "Atleast 1 members are required to create the group" });
  }
  members.push(req.user);
  const newGroupChatPayload = {
    chatName: name,
    about: description,
    isGroup: true,
    members: members,
    createdBy: req.user._id,
    admin: req.user._id,
  };

  try {
    const newChat = await Chat.create(newGroupChatPayload);
    const groupInfo = await Chat.findById(newChat._id)
      .populate("members", "_id name email")
      .populate("admin", "_id name");

    res.status(201).json({
      message: `Group (${groupInfo.chatName}) created successfully.`,
      data: groupInfo,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const editChat = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name, about } = req.body;
  const groupInfo = await Chat.findOne({
    _id: groupId,
    isGroup: true,
  });
  if (groupInfo) {
    try {
      const updatedGroupInfo = await Chat.findByIdAndUpdate(
        groupId,
        { $set: { chatName: name, about: about } },
        { new: true }
      );
      res.status(200).json(updatedGroupInfo);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
    res.status(200).json(groupInfo);
  } else {
    return res.status(404).json({ error: "Invalid Group" });
  }
});

const addMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const newMember = await User.findById(userId);
  const groupInfo = await Chat.findOne({
    _id: groupId,
    isGroup: true,
  });

  // if group or member is invalid
  if (!groupInfo || !newMember) {
    return res.status(404).json({ error: "Invalid member or group" });
  }

  // group admin check
  if (groupInfo.admin.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ error: "Only admin can perform this action" });
  }

  // checking if member already exist
  const groupMemberExistance = await Chat.findOne({
    _id: groupInfo._id,
    members: { $elemMatch: { $eq: userId } },
  });
  if (groupMemberExistance) {
    return res.status(400).json({ error: "Member already exist" });
  }

  try {
    const updatedGroupInfo = await Chat.findByIdAndUpdate(
      groupId,
      { $push: { members: newMember._id } },
      { new: true }
    ).populate("members", "_id name email");
    res.status(200).json(updatedGroupInfo);
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const removeMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const memberTobeRemoved = await User.findById(userId);
  const groupInfo = await Chat.findOne({
    _id: groupId,
    isGroup: true,
    members: { $elemMatch: { $eq: memberTobeRemoved._id } },
  });

  if (!groupInfo || !memberTobeRemoved) {
    return res.status(404).json({ error: "Invalid member or group" });
  }

  // group admin check
  if (groupInfo.admin.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ error: "Only admin can perform this action" });
  }

  try {
    const updatedGroupInfo = await Chat.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberTobeRemoved._id } },
      { new: true }
    ).populate("members", "_id name email");
    res.status(200).json(updatedGroupInfo);
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

module.exports = {
  createChat,
  getSingleChat,
  getChats,
  createGroupChat,
  editChat,
  addMember,
  removeMember,
};
