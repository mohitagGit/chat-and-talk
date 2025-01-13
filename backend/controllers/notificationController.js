const webPush = require("web-push");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Subscriber = require("../models/notifSubscriberModel");
// import Subscriber from "../models/notifSubscriberModel";

const notifSubscribe = asyncHandler(async (req, res) => {
  const { deviceInfo, subscription } = req.body;

  //   checking if existing subscriber
  const existingSubscriber = await Subscriber.findOne({
    userId: req.user._id,
    endpoint: subscription.endpoint,
  });

  if (existingSubscriber && existingSubscriber._id) {
    return res.status(200).json({
      message: "Subscription already exist",
      data: existingSubscriber,
    });
  }
  try {
    const newSubscriber = await Subscriber.create({
      userId: req.user._id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      deviceInfo,
      isActive: true,
    });
    return res
      .status(201)
      .json({ message: "Subscription saved!", data: newSubscriber });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

const sendNotification = asyncHandler(async (req, res) => {
  const { recipient, title, body, icon, data } = req.body;
  let subscriptions;
  if (recipient) {
    const recipientUser = await User.findById(recipient);
    if (recipientUser) {
      subscriptions = await Subscriber.find({
        userId: recipientUser._id,
        isActive: true,
      });
    } else {
      return res.status(403).json({ message: "Not a active user." });
    }
  } else {
    subscriptions = await Subscriber.find({
      isActive: true,
    });
  }

  if (!subscriptions.length) {
    return res.status(404).json({ message: "No active subscriptions found." });
  }

  // Send push notifications to each subscription
  for (const subscription of subscriptions) {
    console.log("Subscription: ", subscription);
    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify({ title, body, icon, data })
      );
    } catch (error) {
      console.error(
        "Push notification error for subscription:",
        subscription,
        error
      );
    }
  }
  res.status(200).json({ message: "Notifications sent!" });
});

module.exports = { notifSubscribe, sendNotification };
