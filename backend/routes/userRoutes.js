const express = require("express");
const authUserCheck = require("../middleware/authHandler");
const {
  registerUser,
  signInUser,
  signOutUser,
  searchUsers,
} = require("../controllers/userController");
const {
  createChat,
  getChats,
  getSingleChat,
  editChat,
  createGroupChat,
  addMember,
  removeMember,
} = require("../controllers/chatController");
const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageController");
const {
  initiateCall,
  updateCallDetails,
  getCallDetails,
  getCallHistory,
} = require("../controllers/callController");
const {
  notifSubscribe,
  sendNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/users/register", registerUser);
router.route("/users/signin").post(signInUser);
router.route("/users/logout").post(authUserCheck, signOutUser);
router.route("/users/search").get(authUserCheck, searchUsers);

router.route("/chats").post(authUserCheck, createChat);
router.route("/chats").get(authUserCheck, getChats);
router.route("/chats/create-group").post(authUserCheck, createGroupChat);
router.route("/chats/:chatId").get(authUserCheck, getSingleChat);
router.route("/chats/:groupId").patch(authUserCheck, editChat);
router.route("/chats/:groupId/add-member").put(authUserCheck, addMember);
router.route("/chats/:groupId/remove-member").put(authUserCheck, removeMember);

router.route("/messages").post(authUserCheck, sendMessage);
router.route("/messages/:groupId").get(authUserCheck, getAllMessages);

router.route("/calls").post(authUserCheck, initiateCall);
router.route("/calls/:callId").put(authUserCheck, updateCallDetails);
router.route("/calls/:callId").get(authUserCheck, getCallDetails);
router.route("/calls").get(authUserCheck, getCallHistory);

router.route("/subscribe").post(authUserCheck, notifSubscribe);
router.route("/send-notification").post(sendNotification);

module.exports = router;
