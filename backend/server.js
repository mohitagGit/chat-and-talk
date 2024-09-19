const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");

const connectDB = require("./config/db");
const { unknownEndpoint, errorHandler } = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send(
    `<p>Navigate to <a href="http://localhost:3000">http://localhost:3000</a> for Varta Application</p>`
  );
});

// handling api calls
app.use("/api", userRoutes);

app.get("/about", (req, res) => {
  res.send("Hey Nodejs About page");
});

app.use(unknownEndpoint);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Running, on port: ${PORT}`.magenta.bold);
});
