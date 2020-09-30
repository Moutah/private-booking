import path from "path";
import fs from "fs";
import { Request, Response } from "express";

/**
 * Reads the client build entry file and returns its content.
 * @param {Request} req
 * @param {Response} res
 */
export const main = (req: Request, res: Response) => {
  const indexFile = path.resolve(`${process.env.CLIENT_BUILD_PATH}/index.html`);

  fs.readFile(indexFile, "utf8", (err, data) => {
    if (err) {
      console.error("Something went wrong:", err);
      return res.status(500).send("Oops, better luck next time!");
    }

    return res.send(data);
  });
};
