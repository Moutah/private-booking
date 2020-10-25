import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

/**
 * Return the client build entry page.
 */
export const main = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileContent = await getFileContent("index.html");
    res.send(fileContent);
  } catch (err) {
    next(err);
  }
};

/**
 * Return the login page.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileContent = await getFileContent("login.html");
    res.send(fileContent);
  } catch (err) {
    next(err);
  }
};

/**
 * Return the register page.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("register");
    const fileContent = await getFileContent("register.html");
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
const getFileContent = async (
  pathRelativeToClientBuild: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const filePath = path.resolve(
      `${process.env.CLIENT_BUILD_PATH}/${pathRelativeToClientBuild}`
    );

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
