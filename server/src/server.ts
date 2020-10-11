import https from "https";
import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import * as db from "./db";
import { webRoutes } from "./routes/web";
import { apiRoutes } from "./routes/api";
import { Server } from "http";
import helmet from "helmet";
import compression from "compression";
import "./models/Booking";
import "./models/Item";
import "./models/Post";
import "./models/User";
import fileUpload from "express-fileupload";

export const app = express();
export let server: Server;

const httpsOptions = {
  key: fs.readFileSync("./../certs/key.pem"),
  cert: fs.readFileSync("./../certs/cert.pem"),
};

/**
 * Start the server by setting up the express app, connecting to the database
 * and defining routes.
 */
export const setup = async () => {
  // make the app
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(compression());
  app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
      createParentPath: true,
    })
  );

  // connect to DB
  await db.connect();

  // register routes
  app.use(webRoutes());
  app.use("/api", apiRoutes());

  // set server
  server = https.createServer(httpsOptions, app);

  return server;
};

/**
 * Starts the server which will listen to given `port`.
 */
export const start = (port: number) =>
  new Promise((resolve) => {
    server.listen(port, () => {
      if (process.env.NODE_ENV !== "test") {
        console.log("Server is running on Port: " + port);
      }
      resolve();
    });
  });

/**
 * Stops the server.
 */
export const stop = () =>
  new Promise(async (resolve) => {
    await db.disconnect();

    server.close(() => {
      if (process.env.NODE_ENV !== "test") {
        console.log("Server is stoped");
      }
      resolve();
    });
  });
