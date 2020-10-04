import { Response } from "express";

export const returnError = (source: string, error: any, response: Response) => {
  // validation error
  if (error.name === "ValidationError") {
    return returnValidationError(error, response);
  }

  // unhandled error
  return returnServerError(source, error, response);
};

/**
 * Handles a server error by loging the error to the console and setting the
 * given `response` to status 500 with message "error".
 * @param source name of the method where the error happened.
 * @param error
 * @param response
 */
export const returnServerError = (
  source: string,
  error: any,
  response: Response
) => {
  console.log(source, error);
  return response.status(500).json("error");
};

/**
 * Handle Mongoose validation errors by setting the given `response` to status
 * 400 with the given mongoose `error` as message.
 * @param error
 * @param response
 */
export const returnValidationError = (error: any, response: Response) => {
  const output = {
    errors: Object.values(error.errors).map((err: any) => err.properties),
  };
  return response.status(400).send(output);
};
