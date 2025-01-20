const webPush = require("web-push");
const mongoose = require("mongoose");
const Subscriber = require("../models/notifSubscriberModel");
const Chat = require("../models/chatModel");

let WEB_URL = "http://localhost:3000";
if (process.env.ENV === "production") {
  WEB_URL = "https://varta-ls5r.onrender.com";
}

const triggerNotification = async (chatId, senderUserId, notifPayload) => {
  let subscriptions = [];
  try {
    const chat = await Chat.findOne({ _id: chatId });
    const receivers = chat.members.filter((member) => {
      return member._id.toString() !== senderUserId.toString();
    });
    if (receivers.length) {
      try {
        subscriptions = await Subscriber.find({
          isActive: true,
          userId: { $in: receivers },
        });
      } catch (error) {
        console.error("No active subscription found for the user");
      }
    }
  } catch (error) {
    console.error("Error fetching message receivers");
  }

  if (subscriptions.length) {
    try {
      subscriptions.forEach((sub) => {
        webPush
          .sendNotification(sub, notifPayload)
          .then(() => console.log("Notification sent to user id: ", sub.userId))
          .catch((err) => {
            if (err.statusCode === 410) {
              deactivateWebNotifSubsription(sub);
              console.log("Subscriber expired, id", sub._id);
            }
            console.error(err.body);
          });
      });
    } catch (error) {
      console.error("Error while sending notification");
    }
  } else {
    console.log("No notification receiver found");
  }
};

const newMessageNotification = (messageData) => {
  const notificationPayload = JSON.stringify({
    title: `New message from ${messageData.sender.name}`,
    icon: "https://varta-ls5r.onrender.com/static/media/logo.9e431da7203380628508.png",
    body: `Message: ${messageData.message}`,
    url: `${WEB_URL}/chats/${messageData.chatId}/messages`,
    data: {
      url: `${WEB_URL}/chats/${messageData.chatId}/messages`,
    },
  });

  triggerNotification(
    messageData.chatId,
    messageData.sender._id,
    notificationPayload
  );
};

const newCallNotification = (data) => {
  const notificationPayload = JSON.stringify({
    title: `Incoming call`,
    icon: "https://varta-ls5r.onrender.com/static/media/logo.9e431da7203380628508.png",
    body: `${data.callType} call from ${data.name}`,
    url: `${WEB_URL}/call/${data.chatId}/${data.callType}`,
  });

  triggerNotification(data.chatId, data.initiator_id, notificationPayload);
};

const declinedCallNotification = async (data) => {
  const notificationPayload = JSON.stringify({
    title: `Call declined`,
    icon: "https://varta-ls5r.onrender.com/static/media/logo.9e431da7203380628508.png",
    body: `${data.callType} call declined by ${data.from.name}`,
    url: `${WEB_URL}/call/${data.chatId}/${data.callType}`,
  });

  triggerNotification(data.chatId, data.from.id, notificationPayload);
};

const deactivateWebNotifSubsription = async (sub) => {
  await Subscriber.findByIdAndUpdate(sub._id, { isActive: false });
};

module.exports = {
  newMessageNotification,
  newCallNotification,
  declinedCallNotification,
  deactivateWebNotifSubsription,
};
