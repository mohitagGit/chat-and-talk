const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./config/db");
const { unknownEndpoint, errorHandler } = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");

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
      `<p>Navigate to <a href="http://localhost:3000">http://localhost:3000</a> for Varta Application</p>`
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
    }
  });

  socket.on("disconnect1", () => {
    console.log("#### User Disconnected ####");
  });

  // idea 2
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("callUser: ", data);
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log("answerCall: ", data);
    io.to(data.to).emit("callAccepted", data.signal);
  });
});
