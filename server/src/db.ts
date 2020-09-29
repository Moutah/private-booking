import mongoose from "mongoose";

let connection;

/**
 * Connect to MongoDB database. Returns a Promise that resolves when the
 * connection is established.
 * @return {Promise<void>}
 */
export const connect = () =>
  new Promise((resolve) => {
    // connect to DB
    mongoose.connect("mongodb://127.0.0.1:27017/private-booking", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // get connection
    connection = mongoose.connection;

    // confirm connection
    connection.once("open", function () {
      console.log("MongoDB database connection established successfully");
      resolve();
    });
  });

/**
 * Connection to the MongoDB database.
 */
export default connection;
