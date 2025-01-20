const Call = require("../models/callModel");
const CallStatus = require("../models/callStatusModel");

const updateCallStatus = async (pCallId, pStatus, pUserId) => {
  try {
    const callStatusPayload = {
      callId: pCallId,
      status: pStatus,
      createdBy: pUserId,
    };
    console.log("Call status params: ", callStatusPayload);

    const newCallStatusData = await CallStatus.create(callStatusPayload);
    console.log("Call status data: ", newCallStatusData);

    const callStatusInfo = await CallStatus.find({
      callId: pCallId,
    })
      .populate("createdBy", "_id name")
      .sort({ createdAt: -1 });

    console.log("new Call status data: ", callStatusInfo);
    return callStatusInfo[0];
  } catch (error) {
    console.error("Error while updating call status: ", error);
  }
};

const initiateCall = async (pCallData) => {
  const callPayload = {
    type: pCallData.callType,
    chatId: pCallData.chatId,
    createdBy: pCallData.userId,
  };

  const newCallData = await Call.create(callPayload);
  return await updateCallStatus(newCallData._id, "initiated", pCallData.userId);
};

module.exports = { updateCallStatus, initiateCall };
