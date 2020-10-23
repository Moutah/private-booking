import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

// load dotenv config
dotenv.config();

// create a test JWT
process.env.TEST_TOKEN = jsonwebtoken.sign(
  {
    sub: -1,
    name: "test token",
  },
  process.env.APP_KEY as string,
  { expiresIn: 3600 } // 1h
);
