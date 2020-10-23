import User, { IUser } from "../models/User";
import { NextFunction, Request, Response } from "express";

/**
 * Returns the user loaded into `req.targetUser`.
 */
export const me = async (req: Request, res: Response) => {
  res.status(200).json(req.targetUser);
};

/**
 * Invites the user with email matching `req.body.email` to join
 * `req.body.item`. If `req.body.asManager` is truthy, the user will be added
 * as manager for the item. If no user exists for the given `req.body.email`,
 * the user will be created and notified to complete his registration.
 */
export const invite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json("invite");
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

    // update item
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

/**
 * Remove user given in `req.targetUser` from the database.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json("remove");
};
