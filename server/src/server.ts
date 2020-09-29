import express, { Express } from "express";
import bodyParser from "body-parser";
import * as db from "./db";
import { webRoutes, staticClientAssets } from "./routes/web";

let server: Express;

/**
 * Start the server by setting up the express app, connecting to the database
 * and defining routes.
 */
export const setup = async () => {
  // make the app
  server = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // connect to DB
  await db.connect();

  // register routes
  server.use(webRoutes);
  if (staticClientAssets) {
    server.use(staticClientAssets);
  }
};

/**
 * Starts the server which will listen to given `port`.
 */
export const start = (port: number) => {
  // start app to listen on PORT
  server.listen(port, () => {
    console.log("Server is running on Port: " + port);
  });
};
