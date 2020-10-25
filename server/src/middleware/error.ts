import * as mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

/**
 * Handles known type of errors and returns the relevant JSON response as well
 * as HTTP status code.
 */
export const handleErrorJson = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (err.name) {
    // validation error
    case "ValidationError":
      res.status(422).json({
        errors: Object.values(
          (err as mongoose.Error.ValidationError).errors
        ).map((err: any) => err.properties),
      });
      break;

    // forbidden error
    case "ForbiddenError":
      res.status(403).json("Forbidden");
      break;

    // not found error
    case "NotFoundError":
      res.status(404).json("Not found");
      break;

    // unhandled error
    default:
      console.error(err);
      res.status(500).json("Something went wrong :(");
      break;
  }

  return next();
};

/**
 * Handles known type of errors and returns the relevant web page as well as
 * HTTP status code.
 */
export const handleErrorWeb = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (err.name) {
    // unhandled error
    default:
      console.error(err);
      res.status(500).json("Something went wrong :(");
      break;
  }

  return next();
};
