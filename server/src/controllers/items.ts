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
 * Get a specific item from the database with slug matching the one in given
 * `req`.
 */
export const get = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.slug);

    // not found
    if (!item) {
      res = returnNotFoundError(res);
      return;
    }

    res.status(200).json(item);
  } catch (err) {
    res = returnError("items.get", err, res);
  }
};

/**
 * Update a specific item from the database with slug matching the one in given
 * `req.params` with the content in `req.body`.
 */
export const update = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.slug);

    // not found
    if (!item) {
      res = returnNotFoundError(res);
      return;
    }

    // update item
    item.description = req.body.description;
    item.address.street = req.body.address.street || item.address.street;
    item.address.zip = req.body.address.zip || item.address.zip;
    item.address.city = req.body.address.city || item.address.city;
    item.address.country = req.body.address.country || item.address.country;
    item.address.lat = req.body.address.lat || item.address.lat;
    item.address.long = req.body.address.long || item.address.long;
    item.equipments = req.body.equipments;
    await item.save();

    res.status(200).send();
  } catch (err) {
    res = returnError("items.update", err, res);
  }
};

/**
 * Remove a specific item from the database with slug matching the one in given
 * `req.params`.
 */
export const remove = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.slug);

    // not found
    if (!item) {
      res = returnNotFoundError(res);
      return;
    }

    // remove item
    await item.remove();

    res.status(200).send();
  } catch (err) {
    res = returnError("items.remove", err, res);
  }
};
