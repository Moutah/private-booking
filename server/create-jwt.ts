import User from "./src/models/User";
import * as db from "./src/db";
import * as dotenv from "dotenv";

// validate arguments
if (process.argv.length != 3) {
  throw new Error(
    "Create Admin requires exactly 1 parameters: username, email and password"
  );
}

// extract arguments
const [nodePath, scriptPath, userEmail] = process.argv;

// load .env
dotenv.config();

console.log(`
******
* CREATE JWT TOKEN
* User email: ${userEmail}
******
`);

// connect to db
console.log("Connecting to database...");
db.connect()
  .then(async () => {
    // get user
    console.log("\nGetting user...");
    const user = await User.findOne({ email: userEmail });

    // not found
    if (!user) {
      throw new Error("No user found with email " + userEmail);
    }

    console.log("User #", user._id.toHexString());

    // generate JWT
    const jwt = user.createActionToken("register");
    // const jwt = user.createJWT();
    console.log("\nFresh JWT:\n", jwt);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\nDisconnecting from database...");
    await db.disconnect();
  });
