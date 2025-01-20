const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Call = require("../models/callModel");
const CallStatus = require("../models/callStatusModel");
// const User = require("../models/userModel");
const { populate } = require("../models/notifSubscriberModel");

const initiateCall = asyncHandler(async (req, res) => {
  const { chatId, type } = req.body;

  if (!chatId || !type) {
    return res.status(400).json({ error: "Required parameter are missing." });
  }

  const chatInfo = await Chat.findOne({
    _id: chatId,
    members: { $elemMatch: { $eq: req.user._id } },
  });

  if (!chatInfo) {
    return res.status(404).json({ error: "Invalid Channel." });
  }

  const callPayload = {
    type,
    chatId: chatInfo._id,
    createdBy: req.user._id,
  };

  try {
    const newCallData = await Call.create(callPayload);
    console.log("Call initiated", newCallData);
    try {
      const callStatusPayload = {
        callId: newCallData._id,
        status: "initiated",
        createdBy: req.user._id,
      };
      const newCallStatusData = await CallStatus.create(callStatusPayload);
      console.log("Call session initiated", newCallStatusData);

      const callStatusInfo = await CallStatus.find({
        callId: newCallData._id,
      }).populate("createdBy", "_id name");

      res.status(201).json({
        message: `Call initiated.`,
        call: newCallData,
        history: callStatusInfo,
      });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const updateCallDetails = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { chatId, status } = req.body;

  // to validate current user with group/chat
  const chatInfo = await Chat.findOne({
    _id: chatId,
    members: { $elemMatch: { $eq: req.user._id } },
  });
  if (!chatInfo) {
    return res.status(403).json({ error: "Invalid request." });
  }

  // validating call from params
  const callData = await Call.findOne({ _id: callId, chatId: chatId });
  if (!callData) {
    return res.status(403).json({ error: "Invalid call." });
  }

  try {
    const callStatusPayload = {
      callId: callData._id,
      status: status,
      createdBy: req.user._id,
    };

    const newCallStatusData = await CallStatus.create(callStatusPayload);
    const callStatusInfo = await CallStatus.find({
      callId: callData._id,
    })
      .populate("createdBy", "_id name")
      .sort({ createdAt: -1 });

    res.status(201).json({
      message: `Call status updated to ${status}`,
      data: callStatusInfo,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const getCallDetails = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { chatId } = req.body;

  // to validate correct user chat and call
  const chatInfo = await Chat.findOne({
    _id: chatId,
    members: { $elemMatch: { $eq: req.user._id } },
  });
  if (!chatInfo) {
    return res.status(403).json({ error: "Invalid request." });
  }

  try {
    const callInfo = await Call.findOne({ _id: callId, chatId: chatId })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({
        path: "callStatuses",
        options: { sort: { createdAt: -1 } },
        populate: { path: "createdBy", select: "_id name" },
      })
      .sort({ createdAt: -1 });
    if (!callInfo) {
      return res.status(404).json({ error: "Invalid Call." });
    }

    res.status(200).json({
      message: `OK`,
      data: callInfo,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const getCallHistory = asyncHandler(async (req, res) => {
  const { channel } = req.query;
  let userChatIds = [];

  // to validate correct user chat and call
  if (channel) {
    const chatInfo = await Chat.findOne({
      _id: channel,
      members: { $elemMatch: { $eq: req.user._id } },
    });
    if (!chatInfo) {
      return res.status(403).json({ error: "Invalid channel." });
    }

    userChatIds = [channel];
  } else {
    const userChats = await Chat.find(
      {
        members: { $elemMatch: { $eq: req.user._id } },
      },
      { _id: 1 }
    );

    if (!userChats.length) {
      return res.status(404).json({ error: "No channel found, so no calls" });
    }

    userChatIds = await userChats.map((chat) => {
      return chat._id;
    });
  }

  try {
    // get callinfo with chatIds
    const callInfo = await Call.find({ chatId: { $in: userChatIds } })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({
        path: "callStatuses",
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: { path: "createdBy", select: "_id name" },
      })
      .sort({ createdAt: -1 })
      .lean();

    // to convert callStatuses array to callStatus object
    callInfo.forEach((call) => {
      if (call.callStatuses?.length) {
        call.callStatus = call.callStatuses[0];
      } else {
        call.callStatus = null;
      }
      delete call.callStatuses;
    });

    res.status(200).json({
      message: `${callInfo.length} call(s) found`,
      data: callInfo,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

module.exports = {
  initiateCall,
  updateCallDetails,
  getCallDetails,
  getCallHistory,
};
