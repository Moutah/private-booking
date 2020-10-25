import * as dotenv from "dotenv";
import * as server from "./src/server";

// load .env
dotenv.config();

// hello
const USER = process.env.USERNAME || "";
const HOST = process.env.HOSTNAME || "";

console.log(`


         ____       _             __         
        / __ \\_____(_)   ______ _/ /____     
       / /_/ / ___/ / | / / __ \`/ __/ _ \\    
      / ____/ /  / /| |/ / /_/ / /_/  __/    
     /_/   /_/  /_/ |___/\\__,_/\\__/\\___/     
         ____              __   _            
        / __ )____  ____  / /__(_)___  ____ _
       / __  / __ \\/ __ \\/ //_/ / __ \\/ __ \`/
      / /_/ / /_/ / /_/ / ,< / / / / / /_/ /  
     /_____/\\____/\\____/_/|_/_/_/ /_/\\__, /  
                                    /____/   


  ***********************************************
  *                                             *
  *  SERVER                                     *
  *                                             *
  *  Start time: ${new Date().toISOString()}       *
  *  User: ${USER.padEnd(32, " ")}     *
  *  Host: ${HOST.padEnd(32, " ")}     *
  *                                             *
  ***********************************************
`);

// boot the server
const PORT = parseInt(process.env.PORT || "4000");
server.setup().then(() => {
  server.start(PORT);
});
