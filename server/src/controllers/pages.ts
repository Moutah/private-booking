import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

/**
 * Route handler factory that returns the content of given
 * `pathRelativeToClientBuild` as response.
 */
const returnFile = (clientBuild: string, filePath: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buildDir =
      clientBuild === "secure"
        ? process.env.CLIENT_SECURE_BUILD_PATH
        : process.env.CLIENT_PUBLIC_BUILD_PATH;
    const fileContent = await getFileContent(`${buildDir}/${filePath}`);
    res.send(fileContent);
  } catch (err) {
    next(err);
  }
};

/**
 * Reads the file at given `pathRelativeToClientBuild` returns its content.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<string>}
 */
const getFileContent = async (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileFullPath = path.resolve(filePath);

    fs.readFile(fileFullPath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });

/**
 * Return the client build entry page.
 */
export const main = returnFile("secure", "index.html");

/**
 * Return the login page.
 */
export const login = returnFile("public", "index.html");
