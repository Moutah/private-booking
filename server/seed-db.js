require("ts-node").register();
const { Seeder } = require("mongo-seeding");
const dotenv = require("dotenv");
const path = require("path");
const { calcBindings } = require("./data/documentSeeds");
const Item = require("./src/models/Item").default;
const User = require("./src/models/User").default;

// load .env
dotenv.config();

const seeder = new Seeder({
  database: process.env.DB_HOST,
  dropDatabase: true,
});

calcBindings();

const collections = seeder.readCollectionsFromPath(path.resolve("./data"), {
  extensions: ["ts"],
  transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
});

console.log("seeding...");
seeder.import(collections).then(() => console.log("done"));
