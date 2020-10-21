import User from "./src/models/User";
import * as db from "./src/db";
import * as dotenv from "dotenv";

// validate arguments
if (process.argv.length != 5) {
  throw new Error(
    "Create Admin requires exactly 3 parameters: username, email and password"
  );
}

// extract arguments
const [nodePath, scriptPath, name, email, password] = process.argv;

// load .env
dotenv.config();

console.log(`
******
* CREATE ADMIN USER
* Username: ${name}
* Email: ${email}
* Password: ${password.replace(/./g, "*")}
******
`);

// connect to db
console.log("Connecting to database...");
db.connect()
  .then(async () => {
    // create user
    console.log("\nAdding user...");
    const user = new User({
      name,
      email,
      password,
    });
    await user.save();
    console.log("User added successfully");

    console.log("\nDisconnecting from database...");
    await db.disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
