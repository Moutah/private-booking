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

export const validateRefreshToken = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id)
      .select("refreshHash")
      .exec();
    const jwt = jsonwebtoken.decode(
      ExtractJwt.fromAuthHeaderAsBearerToken()(req) as string
    ) as { [key: string]: any };

    // user not found or not admin
    if (!user || user.refreshHash !== jwt.hash) {
      throw new UnauthorizedError("Unrecognized refresh token");
    }

    // set user to req
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
