const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./config/db");
const { unknownEndpoint, errorHandler } = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const {
  newMessageNotification,
  newCallNotification,
  declinedCallNotification,
} = require("./services/notificationService");
const { updateCallStatus, initiateCall } = require("./services/callService");

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// handling api calls
app.use("/api", userRoutes);

app.get("/about", (req, res) => {
  res.send("Hey Nodejs About page");
});

const vapidKeys = webPush.generateVAPIDKeys();
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);

webPush.setVapidDetails(
  "mailto:varta@yopmail.com",
  "BG243oWtud_-lweR_SrJVkUsXrM4qacJDenstYIHjlo4hEflJoi6aoqxxS21tLKxuvwEaqiJaiFyPyhQKL7YPGU",
  "qdBJNcQQqNrxw3Cbl7mnmrHekVktqTUSD4SAAIq1G9o"
);

// for deployment
const __dirName1 = path.resolve();
if (process.env.ENV === "production") {
  console.log("Running in prod mode");
  app.use(express.static(path.join(__dirName1, "/frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirName1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      `<div>Navigate to <div href="http://localhost:3000">http://localhost:3000</div> for Vartalaap Application</div>`
    );
  });
}

app.use(unknownEndpoint);
app.use(errorHandler);

// Start the server
const nodeServer = app.listen(PORT, () => {
  console.log(`Running, on port: ${PORT}`.magenta.bold);
});

// Initialize Socket.IO on the server
const io = new Server(nodeServer, {
  pingTimeout: 30000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Mysocket id: ", socket.id);
  socket.on("JOINED_CHAT_ROOM", (chatId) => {
    socket.join(chatId);
    console.log("User Joined Chat Room: " + chatId);
  });

  socket.on("TYPING", (username, chatId, content) => {
    console.log(`${username} is typing in group ${chatId}: ${content}`);
    socket.to(chatId).emit("USER_TYPING", chatId, username, content);
  });

  socket.on("TYPING_STOPPED", (chatId) =>
    socket.to(chatId).emit("USER_TYPING_STOPPED")
  );

  socket.on("NEW_MESSAGE_TO_SERVER", (messageData) => {
    if (messageData && messageData.chatId) {
      const chatId = messageData.chatId;
      socket.to(chatId).emit("NEW_MESSAGE_TO_CLIENT", { messageData });
      newMessageNotification(messageData);
    }
  });

  socket.on("disconnect1", () => {
    console.log("#### User Disconnected ####");
  });

  // idea 2
  socket.emit("ME", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("JOINED_CALL_ROOM", (chatId) => {
    socket.join(chatId);
    console.log("User Joined Chat Room: " + chatId);
  });

  socket.on("CALL_USER", async (data) => {
    console.log("CALL_USER: ", data);
    const payload = {
      userId: data.initiator_id,
      callType: data.callType,
      chatId: data.chatId,
    };
    const newCall = await initiateCall(payload);
    console.log("New call data: ", newCall);
    io.to(data.chatId).emit("RECEIVE_CALL", {
      signal: data.signalData,
      from: socket.id,
      initiator_id: data.initiator_id,
      name: data.name,
      call_data: newCall,
    });
    newCallNotification(data);
  });

  socket.on("ANSWER_CALL", async (data) => {
    console.log("ANSWER_CALL: ", data);
    // const payload = {
    //   userId: data.initiator_id,
    //   callId: data.callId,
    //   status: "answered",
    // };
    // const updatedCall = await updateCallStatus(payload);
    io.to(data.to).emit("CALL_ACCEPTED", data.signal);
  });

  socket.on("DECLINE_CALL", async (data) => {
    console.log("DECLINE_CALL: ", data);
    // const payload = {
    //   userId: data.from.id,
    //   callId: data.callId,
    //   status: "declined",
    // };
    // const updatedCall = await updateCallStatus(payload);
    io.to(data.to).emit("CALL_DECLINED", { from: data.from.name });
    declinedCallNotification(data);
  });

  socket.on("MISSED_CALL", async (data) => {
    console.log("MISSED_CALL: ", data);
    const payload = {
      userId: data.from.id,
      callId: data.callId,
      status: "missed",
    };
    const updatedCall = await updateCallStatus(payload);
    io.to(data.to).emit("CALL_NOT_ANSWERED", { from: data.from.name });
    declinedCallNotification(data);
  });

  socket.on("END_CALL", async (data) => {
    console.log("END_CALL: ", data);
    // const payload = {
    //   userId: data.from.id,
    //   callId: data.callId,
    //   status: "ended",
    // };
    // const updatedCall = await updateCallStatus(payload);
    io.to(data.to).emit("CALL_ENDED", { from: data.from.name });
  });
});
