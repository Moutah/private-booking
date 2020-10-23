import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

// load dotenv config
dotenv.config();

// create a test JWT
process.env.TEST_USER_ID = "000000000000000000000000";
process.env.TEST_TOKEN = jsonwebtoken.sign(
  {
    sub: process.env.TEST_USER_ID,
    name: "test token",
  },
  process.env.APP_KEY as string,
  { expiresIn: 3600 } // 1h
);
