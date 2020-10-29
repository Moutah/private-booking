import User, { IUser } from "../models/User";
import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";

/**
 * Returns the user loaded into `req.targetUser`.
 */
export const me = async (req: Request, res: Response) => {
  res.status(200).json(req.targetUser);
};

/**
 * Update user given in `req.targetUser` with content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let user = req.targetUser as IUser;

    // update user
    user.name = req.body.name || user.name;
    user.profileImage =
      req.body.images && req.body.images.length > 0
        ? req.body.images[0]
        : user.profileImage;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    await user.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
