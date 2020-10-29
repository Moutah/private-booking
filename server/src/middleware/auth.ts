import jsonwebtoken from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { ExtractJwt } from "passport-jwt";
import { ForbiddenError, UnauthorizedError } from "../errors";
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

/**
 * Returns an express middleware function that verify that the current JWT is
 * not revoked.
 * @throws `UnauthorizedError`
 */
export const validateRefreshToken = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id)
      .select("refreshHash")
      .exec();

    // user not found or hash mismatch
    if (!user || user.refreshHash !== req.authInfo?.hash) {
      throw new UnauthorizedError("Unrecognized refresh token");
    }

    // set user to req
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns an express middleware function that verify that the current action
 * JWT is for given `action`.
 * @throws `UnauthorizedError`
 */
export const validateActionToken = (action: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.authInfo?.action !== action) {
      throw new UnauthorizedError("Unrecognized refresh token");
    }

    next();
  } catch (err) {
    next(err);
  }
};
