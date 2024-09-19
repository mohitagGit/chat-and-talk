const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected host", dbConnection.connection.host.cyan.bold);
    console.log("DB connected port", dbConnection.connection.port);
    console.log("DB connected name", dbConnection.connection.name);
  } catch (error) {
    console.log("DB Connection error:", error);
    process.exit();
  }
};

module.exports = connectDB;
