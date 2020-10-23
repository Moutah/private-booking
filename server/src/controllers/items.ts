import Item, { IItem } from "../models/Item";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { storeUploadedFile } from "../middleware/store-image";

/**
 * Returns all items.
 */
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * Inserts an item in the database with values from the given `req.body`.
 */
export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // create item
    let item = new Item({
      ...req.body,
      owner: req.user?._id,
      managers: [req.user?._id],
      slug: slugify(req.body.name || ""),
    });

    // handle file upload
    if (req.files) {
      // store file
      const fileRelativePath = await storeUploadedFile(req.files.images, item);

      // adds the new path to item
      item.images = [`/images/${fileRelativePath}`];
    }

    await item.save();

    // return item
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific item from the database with slug matching the one in given
 * `req.params`.
 */
export const get = async (req: Request, res: Response) => {
  res.status(200).json(req.item);
};

/**
 * Update a specific item from the database with slug matching the one in given
 * `req.params` with the content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let item = req.item as IItem;

    // update item
    item.description = req.body.description;
    if (req.body.address) {
      item.address.street = req.body.address.street || item.address.street;
      item.address.zip = req.body.address.zip || item.address.zip;
      item.address.city = req.body.address.city || item.address.city;
      item.address.country = req.body.address.country || item.address.country;
      item.address.lat = req.body.address.lat || item.address.lat;
      item.address.long = req.body.address.long || item.address.long;
    }
    item.images = req.body.images || item.images;
    item.equipments = req.body.equipments;
    await item.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a specific item from the database with slug matching the one in given
 * `req.params`.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // remove item
    await (req.item as IItem).remove();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
