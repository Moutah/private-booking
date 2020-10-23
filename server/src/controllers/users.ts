import { Request, Response } from "express";

/**
 * Returns the user loaded into `req.targetUser`.
 */
export const me = (req: Request, res: Response) => {
  res.status(200).json(req.targetUser);
};

/**
 * Invites the user with email matching `req.body.email` to join
 * `req.body.item`. If `req.body.asManager` is truthy, the user will be added
 * as manager for the item. If no user exists for the given `req.body.email`,
 * the user will be created and notified to complete his registration.
 */
export const invite = (req: Request, res: Response) => {
  res.json("invite");
};

/**
 * Update user given in `req.targetUser` with content in `req.body`.
 */
export const update = (req: Request, res: Response) => {
  res.json("update");
};

/**
 * Remove user given in `req.targetUser` from the database.
 */
export const remove = (req: Request, res: Response) => {
  res.json("remove");
};
