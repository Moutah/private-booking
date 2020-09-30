import * as dotenv from "dotenv";

export default async () => {
  // load tsting .env
  dotenv.config({ path: "../.env.test" });
};
