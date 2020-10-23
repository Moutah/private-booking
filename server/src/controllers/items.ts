import Item, { IItem } from "../models/Item";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { storeUploadedFile } from "../middleware/store-image";
import { IUser } from "../models/User";
import { ForbiddenError } from "../errors";

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
      const fileRelativePath = await storeUploadedFile(
        req.files.images,
        item.slug
      );

      // adds the new path to item
      item.images = [`/images/${fileRelativePath}`];
    }

    await item.save();

    // add item to user
    const user = req.targetUser as IUser;
    user.items.push(item._id);
    await user.save();

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
 * Remove the relation between `req.targetUser` and `req.item`. If
 * req.targetUser` is the owner, return 403 Forbidden becuase an Item cannot
 * have no owner.
 */
export const unregister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestorId = req.user?._id;
    const user = req.targetUser as IUser;
    const item = req.item as IItem;

    // cannot unregister item's owner
    if (item.owner.toHexString() == user._id) {
      throw new ForbiddenError();
    }

    // cannot unregister other user if not item's manager
    if (
      user._id != requestorId &&
      !item.managers.some((managerId) => managerId.toHexString() == requestorId)
    ) {
      throw new ForbiddenError();
    }

    // unregisters item from user
    user.items = user.items.filter(
      (itemId) => item._id.toHexString() != itemId.toHexString()
    );
    await user.save();

    // unregisters user from item's manager
    item.managers = item.managers.filter(
      (managerId) => user._id.toHexString() != managerId.toHexString()
    );
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
