import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";
import User from "../models/User";

/**
 * Returns an express middleware function that verify that the JWT user is
 * an admin.
 * @throws `ForbiddenError`
 */
export const verifyUserIsAdmin = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).exec();

    // user not found or not admin
    if (!user?.isAdmin) {
      throw new ForbiddenError("Insufficient rights");
    }

    next();
  } catch (err) {
    next(err);
  }
};
