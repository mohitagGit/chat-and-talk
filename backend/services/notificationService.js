const webPush = require("web-push");
const mongoose = require("mongoose");
const Subscriber = require("../models/notifSubscriberModel");
const Chat = require("../models/chatModel");

let WEB_URL = "http://localhost:3000";
if (process.env.ENV === "production") {
  WEB_URL = "https://varta-ls5r.onrender.com";
}

const newMessageNotification = async (messageData) => {
  const notificationPayload = JSON.stringify({
    title: `New message from ${messageData.sender.name}`,
    icon: "https://varta-ls5r.onrender.com/static/media/logo.9e431da7203380628508.png",
    body: `Message: ${messageData.message}`,
    url: `${WEB_URL}/chats/${messageData.chatId}/messages`,
    data: {
      url: `${WEB_URL}/chats/${messageData.chatId}/messages`,
    },
  });

  let subscriptions = [];
  try {
    const chat = await Chat.findOne({ _id: messageData.chatId });
    console.log("Chat data retrieved: ", chat);
    console.log("Chat members: ", chat.members);
    const receivers = chat.members.filter((member) => {
      return member._id.toString() !== messageData.sender._id.toString();
    });
    console.log("Message receivers: ", receivers);
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
          .sendNotification(sub, notificationPayload)
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

const newCallNotification = async (data) => {
  const notificationPayload = JSON.stringify({
    title: `Incoming call`,
    icon: "https://varta-ls5r.onrender.com/static/media/logo.9e431da7203380628508.png",
    body: `${data.callType} call from ${data.name}`,
    url: `${WEB_URL}/chats/${data.chatId}/messages`,
  });

  let subscriptions = [];
  try {
    const chat = await Chat.findOne({ _id: data.chatId });
    console.log("Chat data retrieved: ", chat);
    console.log("Chat members: ", chat.members);
    const receivers = chat.members.filter((member) => {
      return member._id.toString() !== data.initiator_id.toString();
    });
    console.log("Notification receivers: ", receivers);
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
          .sendNotification(sub, notificationPayload)
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

const deactivateWebNotifSubsription = async (sub) => {
  await Subscriber.findByIdAndUpdate(sub._id, { isActive: false });
};

module.exports = {
  newMessageNotification,
  newCallNotification,
  deactivateWebNotifSubsription,
};
