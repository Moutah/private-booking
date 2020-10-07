import { IItem } from "../models/Item";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";

/**
 * Inserts an place to `req.item` with values from the given `req.body`.
 */
export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = req.item as IItem;

    // create place
    item.places.push(req.body);
    await item.save();

    // return item
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a specific item place with id matching the one in given `req.params`
 * with the content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = req.item as IItem;
    const place = item.places.id(req.params.placeId);

    if (!place) {
      throw new NotFoundError();
    }

    // update item
    place.name = req.body.name || place.name;
    place.description = req.body.description || place.description;
    place.type = req.body.type;
    await item.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a specific item place with id matching the one in given `req.params`.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = req.item as IItem;
    const place = item.places.id(req.params.placeId);

    if (!place) {
      throw new NotFoundError();
    }

    // remove place
    await place.remove();
    await item.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
