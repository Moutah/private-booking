import express, { Express } from "express";
import bodyParser from "body-parser";
import * as db from "./db";
import { webRoutes, staticClientAssets } from "./routes/web";
import { Server } from "http";

export const app: Express = express();
export let activeServer: Server;

/**
 * Start the server by setting up the express app, connecting to the database
 * and defining routes.
 */
export const setup = async () => {
  // make the app
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // connect to DB
  await db.connect();

  // register routes
  app.use(webRoutes);
  const staticWebRoutes = staticClientAssets();
  if (staticWebRoutes) {
    app.use(staticWebRoutes);
  }
};

/**
 * Starts the server which will listen to given `port`.
 */
export const start = (port: number) =>
  new Promise((resolve) => {
    activeServer = app.listen(port, () => {
      console.log("Server is running on Port: " + port);
      resolve();
    });
  });

/**
 * Stops the server.
 */
export const stop = () =>
  new Promise((resolve) => {
    activeServer.close(() => {
      console.log("Server is stoped");
      resolve();
    });
  });
