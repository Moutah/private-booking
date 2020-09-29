import express, { Express } from "express";
import bodyParser from "body-parser";
import * as db from "./db";
import { webRoutes, staticClientAssets } from "./routes/web";

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
  server.use(webRoutes);
  if (staticClientAssets) {
    server.use(staticClientAssets);
  }

  // start app to listen on PORT
  server.listen(PORT, () => {
    console.log("Server is running on Port: " + PORT);
  });
};
