import * as dotenv from "dotenv";
import * as server from "./src/server";

// load .env
dotenv.config();

// hello
const USER = process.env.USERNAME || "";
const HOST = process.env.HOSTNAME || "";
console.log(`



       /$$$$$$                           /$$                           /$$$$ 
      /$$__  $$                         | $$                          /$$  $$
     | $$  \\__/ /$$   /$$  /$$$$$$      | $$$$$$$   /$$$$$$   /$$$$$$|__/\\ $$
     |  $$$$$$ | $$  | $$ /$$__  $$     | $$__  $$ /$$__  $$ /$$__  $$   /$$/
      \\____  $$| $$  | $$| $$  \\ $$     | $$  \\ $$| $$  \\__/| $$  \\ $$  /$$/ 
      /$$  \\ $$| $$  | $$| $$  | $$     | $$  | $$| $$      | $$  | $$ |__/  
     |  $$$$$$/|  $$$$$$/| $$$$$$$/     | $$$$$$$/| $$      |  $$$$$$/  /$$  
      \\______/  \\______/ | $$____/      |_______/ |__/       \\______/  |__/  
                         | $$                                                    
                         | $$                                                    
                         |__/                                                    

                         
  *****************************************************************************
  *                                                                           *
  *  PRIVATE BOOKING                                                          *
  *  SERVER                                                                   *
  *                                                                           *
  *  Start time: ${new Date().toISOString()}                                     *
  *  User: ${USER.padEnd(40, " ")}                           *
  *  Host: ${HOST.padEnd(40, " ")}                           *
  *                                                                           *
  *****************************************************************************
`);

// boot the server
const PORT = parseInt(process.env.PORT || "4000");
server.setup().then(() => {
  server.start(PORT);
});
