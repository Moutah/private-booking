import Item from "../models/Item";
import { Request, Response } from "express";
import { returnError } from "./helpers";

/**
 * Returns all items.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const items = await Item.find().populate("owner managers");
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
    let item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res = returnError("items.insert", err, res);
  }
};
