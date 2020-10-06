import * as mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

export const handleError = (
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
