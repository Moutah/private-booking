import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";
import Booking from "../models/Booking";
import Item from "../models/Item";
import Post from "../models/Post";
import User from "../models/User";

/**
 * Returns an express middleware function that loads the item with slug
 * matching the value of `req.params[param]` into `req.item`.
 * @param {string} param Name of the paramter to use in `req.params`
 * @throws `NotFoundError`
 */
export const loadItemBySlug = (param: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.item = await Item.findBySlug(req.params[param]);
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns an express middleware function that loads the post with id
 * matching the value of `req.params[param]` into `req.post`.
 * @param {string} param Name of the paramter to use in `req.params`
 * @throws `NotFoundError`
 */
export const loadPostById = (param: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params[param]).exec();

    // not found
    if (!post) {
      throw new NotFoundError();
    }

    req.post = post;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns an express middleware function that loads the booking with id
 * matching the value of `req.params[param]` into `req.booking`.
 * @param {string} param Name of the paramter to use in `req.params`
 * @throws `NotFoundError`
 */
export const loadBookingById = (param: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params[param]).exec();

    // not found
    if (!booking) {
      throw new NotFoundError();
    }

    req.booking = booking;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns an express middleware function that loads the user with id
 * matching the value of `req.params[param]` into `req.targetUser`.
 * @param {string} param Name of the paramter to use in `req.params`
 * @throws `NotFoundError`
 */
export const loadTargetUserById = (param: string) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params[param]).exec();

    // not found
    if (!user) {
      throw new NotFoundError();
    }

    req.targetUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns an express middleware function that loads the user with id
 * matching the value of `req.params[param]` into `req.targetUser`.
 * @throws `NotFoundError`
 */
export const loadMeAsTargetUser = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).exec();

    // not found
    if (!user) {
      throw new NotFoundError();
    }

    req.targetUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
