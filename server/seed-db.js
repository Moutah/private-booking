require("ts-node").register();
const { Seeder } = require("mongo-seeding");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const { calcBindings } = require("./data/documentSeeds");
const Item = require(`./src/models/Item`).default;

// load .env
dotenv.config();

const seeder = new Seeder({
  database: process.env.DB_HOST,
  dropDatabase: true,
});

/**
 * Try seeding the database until valid.
 */
const seedDatabase = async () => {
  try {
    // generate collections
    const collections = generateCollections();

    // build database
    await buildDatabase(collections);
  } catch (error) {
    console.log(
      "  \x1b[31m%s\x1b[0m\n",
      "Database invalid, please start again"
    );
  }
};

/**
 * Generate collections based on files within the `server/data` directory.
 */
const generateCollections = () => {
  console.log("\n  Calculating document bindings...");
  calcBindings();

  console.log("  Creating collections...");
  const collections = seeder.readCollectionsFromPath(path.resolve("./data"), {
    extensions: ["ts"],
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
  });

  console.log("  \x1b[32m%s\x1b[0m\n", "Collections generated");

  return collections;
};

/**
 * Builds the database with given `collections` and ensure indexes are in place.
 * @param {SeederCollection[]} collections
 */
const buildDatabase = (collections) =>
  new Promise((resolve, reject) => {
    console.log("  Building database...");
    seeder.import(collections).then(async () => {
      console.log("  Ensuring indexes...");

      // connect to DB manually
      mongoose.connect(process.env.DB_HOST, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // connection done
      mongoose.connection.once("open", async function () {
        // ensure Item index
        try {
          await Item.ensureIndexes();

          // disconnect
          mongoose.disconnect(() => {
            resolve();

            console.log("  \x1b[32m%s\x1b[0m\n", "Database built successfully");
          });
        } catch (err) {
          // disconnect
          mongoose.disconnect(reject(err));
        }
      });
    });
  });

// run the process
console.log("\nSEEDING DATABASE");
seedDatabase().then(() => console.log("done :)"));
