import express from "express";
import bodyParser from "body-parser";
import * as authController from "./controllers/auth";
import * as db from "./db";

const PORT = process.env.PORT || 4000;

/**
 * Start the server by setting up the express app, connecting to the database
 * and defining routes.
 */
export const start = async () => {
  // make the app
  const server = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // connect to DB
  await db.connect();

  // register routes
  server.get("/", (req, res) => {
    res.send("Hello World");
  });
  server.get("/login", authController.login);
  server.get("/logout", authController.logout);

  // start app to listen on PORT
  server.listen(PORT, () => {
    console.log("Server is running on Port: " + PORT);
  });
};
