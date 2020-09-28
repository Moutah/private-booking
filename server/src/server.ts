import express from "express";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 4000;

// make the app
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get("/", (req, res) => {
  res.send("Hello World");
});

// start app to listen on PORT
server.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
