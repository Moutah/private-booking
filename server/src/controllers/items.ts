import Item from "../models/Item";
import { Request, Response } from "express";
import { returnError } from "./helpers";

/**
 * Returns all items.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const items = await Item.find().populate("owner managers bookings");
    res.json(items);
  } catch (err) {
    res = returnError("items.index", err, res);
  }
};
