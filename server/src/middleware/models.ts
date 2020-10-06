import { NextFunction, Request, Response } from "express";
import Item from "../models/Item";

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
