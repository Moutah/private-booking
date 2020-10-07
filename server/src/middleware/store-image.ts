import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { IItem } from "../models/Item";

/**
 * Returns an express middleware function that handles an uploaded file by
 * looking at `req.files`. If a file is present, stores it to the storage
 * folder and adds the file url to `req.body.images` array.
 */
export const handleImageUpload = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // no uploaded file to handle
    if (!req.files) {
      console.log("no file -> next");
      return next();
    }

    // accessing things
    const item = req.item as IItem;
    const newFile = req.files.file;

    // building paths
    const itemStoragePath = `${process.env.PWD}/${process.env.STORAGE_PATH}/${item.slug}`;
    const filePath = `${itemStoragePath}/${newFile.name}`;
    const fileUrl = `/images/${item.slug}/${newFile.name}`;

    // overwrite existing file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // move the new file to its destination
    newFile.mv(filePath, (err) => {
      if (err) {
        throw err;
      }

      // adds the new path to req
      req.body.images = req.body.images
        ? [...req.body.images, fileUrl]
        : [fileUrl];

      next();
    });
  } catch (err) {
    next(err);
  }
};
