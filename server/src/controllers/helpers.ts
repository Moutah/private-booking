import { Response } from "express";

/**
 * Handles a server error by loging the error to the console and setting the
 * given `response` to status 500 with message "error".
 * @param source name of the method where the error happened.
 * @param error
 * @param response
 */
export const returnError = (source: string, error: any, response: Response) => {
  console.log(source, error);
  return response.status(500).json("error");
};
