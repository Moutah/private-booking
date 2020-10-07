import { IItem } from "../models/Item";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";

/**
 * Inserts an info to `req.item` with values from the given `req.body`.
 */
export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = req.item as IItem;

    // create info
    item.infos.push(req.body);
    await item.save();

    // return item
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a specific item info with id matching the one in given `req.params`
 * with the content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = req.item as IItem;
    const info = item.infos.id(req.params.infoId);

    if (!info) {
      throw new NotFoundError();
    }

    // update item
    info.title = req.body.title || info.title;
    info.message = req.body.message || info.message;
    // info.image = ...
    await item.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a specific item info with id matching the one in given `req.params`.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = req.item as IItem;
    const info = item.infos.id(req.params.infoId);

    if (!info) {
      throw new NotFoundError();
    }

    // remove info
    await info.remove();
    await item.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
