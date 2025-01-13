import { UAParser } from "ua-parser-js";
import axiosInstance from "../routes/axiosInstance";

const getDeviceInfo = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    browser: result.browser.name,
    browserVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    deviceType: result.device.type || "desktop",
  };
};

const subscribeForNotif = async (currentUser) => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        "BG243oWtud_-lweR_SrJVkUsXrM4qacJDenstYIHjlo4hEflJoi6aoqxxS21tLKxuvwEaqiJaiFyPyhQKL7YPGU",
    });

    const existingSubscription = currentUser.subscriber.filter(
      (item) => item.endpoint === subscription.endpoint
    );
    if (existingSubscription.length) {
      console.log("Notifications already subscribed");
      return false;
    }
    const deviceInfo = getDeviceInfo();

    const subscribePayload = {
      subscription,
      deviceInfo,
    };

    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    // Send subscription to your backend
    try {
      const response = await axiosInstance.post(
        `/api/subscribe`,
        subscribePayload,
        config
      );

      return console.log("Notif Subscription successful:", response.data.data);
    } catch (error) {
      return console.log("Error during push notification registration:", error);
    }
  }
};

export const registerPushNotifications = async (currentUser) => {
  // to check Notification access status
  if (Notification.permission === "denied") {
    console.log("Notifications are blocked.");
    return;
  } else if (Notification.permission === "granted") {
    console.log("Notifications are allowed.");
    subscribeForNotif(currentUser);
  } else if (Notification.permission === "default") {
    console.log("Notifications permission not yet requested.");
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notifications are allowed.");
        subscribeForNotif(currentUser);
      } else {
        console.log("Notifications are denied.");
      }
    });
  }
};
