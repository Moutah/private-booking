import Item from "../models/Item";
import { Request, Response } from "express";
import { returnError, returnNotFoundError } from "./helpers";
import slugify from "slugify";

/**
 * Returns all items.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res = returnError("items.index", err, res);
  }
};

/**
 * Inserts an item in the database with values from the given `req` body.
 */
export const insert = async (req: Request, res: Response) => {
  try {
    let item = new Item({
      ...req.body,
      slug: slugify(req.body.name || ""),
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res = returnError("items.insert", err, res);
  }
};

/**
 * Get a specific item from the database with slug matching the one in given `req`.
 */
export const get = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.slug);

    if (item) {
      res.status(200).json(item);
    } else {
      res = returnNotFoundError(res);
    }
  } catch (err) {
    res = returnError("items.get", err, res);
  }
};
