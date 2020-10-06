require("ts-node").register();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// load .env
dotenv.config();

/**
 * Drops the database.
 */
const dropDatabase = () =>
  new Promise((resolve, reject) => {
    // connect to DB manually
    mongoose.connect(process.env.DB_HOST, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // connection done
    mongoose.connection.once("open", async function () {
      // drop database
      mongoose.connection.db.dropDatabase(() => mongoose.disconnect(resolve));
    });
  });

// run the process
console.log("\nDROPING DATABASE");
dropDatabase().then(() => console.log("done :)"));
