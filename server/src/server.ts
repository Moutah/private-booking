import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import * as authController from "./controllers/auth";

const PORT = process.env.PORT || 4000;

// make the app
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// connect to DB
mongoose.connect("mongodb://127.0.0.1:27017/private-booking", {
  useNewUrlParser: true,
});
const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

server.get("/", (req, res) => {
  res.send("Hello World");
});
server.get("/login", authController.login);
server.get("/logout", authController.logout);

// start app to listen on PORT
server.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
