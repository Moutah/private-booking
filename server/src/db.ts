import mongoose, { mongo } from "mongoose";

/**
 * Connection to the MongoDB database.
 */
export let connection: mongoose.Connection;

/**
 * Connect to MongoDB database. Returns a Promise that resolves when the
 * connection is established.
 */
export const connect = () =>
  new Promise((resolve, reject) => {
    // database details not set
    if (!process.env.DB_HOST) {
      reject("DB_HOST not set");
      return;
    }

    // connect to DB
    mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // get connection
    connection = mongoose.connection;

    // confirm connection
    connection.once("open", function () {
      console.log("MongoDB database connection established successfully.");
      resolve();
    });
  });

/**
 * Disconnect current `connection`.
 */
export const disconnect = () =>
  new Promise((resolve) => {
    console.log("MongoDB database connection closed.");
    mongoose.disconnect(resolve);
  });
