import fs from "fs";
import { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import slugify from "slugify";
import { nextAvailableSlug } from "../helpers";

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
    if (!req.files) return next();

    // get file extension
    let { extension: fileExtension } = getFileNameParts(req.files.images.name);

    // ignore non image files
    if (!["jpg", "jpeg", "gif", "png"].includes(fileExtension)) {
      return next();
    }

    // getting owner
    const imageOwner = req.item ? req.item.slug : "users";

    // updating image name
    if (imageOwner == "users") {
      req.files.images.name = req.user?._id + "." + fileExtension;
    }

    // store file
    const fileRelativePath = await storeUploadedFile(
      req.files.images,
      imageOwner
    );

    // adds the new path to req
    const fileUrl = `/images/${fileRelativePath}`;
    if (req.body.images) {
      req.body.images = Array.isArray(req.body.images)
        ? [...req.body.images, fileUrl]
        : [req.body.images, fileUrl];
    } else {
      req.body.images = [fileUrl];
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Stores the given `file` in the storage folder of given `item`. Resolves on
 * the stored file relative path in the storage.
 * @param {fileUpload.UploadedFile} file
 * @param {string imageOwnerDir
 * @return {Promise<string>}
 */
export const storeUploadedFile = async (
  file: fileUpload.UploadedFile,
  imageOwnerDir: string
) => {
  return new Promise((resolve, reject) => {
    // get storage paths
    const storagePath = `${process.env.PWD}/${process.env.STORAGE_PATH}`;
    const itemStoragePath = `${storagePath}/${imageOwnerDir}`;

    // get name and extension
    let { basename: fileName, extension: fileExtension } = getFileNameParts(
      file.name
    );

    // slugify name
    let fileSlug = slugify(fileName);

    // validate file name parts
    if (!fileSlug || !fileExtension) {
      reject(new Error("Invalid file name"));
    }

    // get next available slug for this file
    if (fs.existsSync(itemStoragePath)) {
      const files = fs.readdirSync(itemStoragePath);
      const matchingFiles = files.filter((file) => file.startsWith(fileSlug));
      fileSlug = nextAvailableSlug(fileSlug, matchingFiles);
    }

    // move the new file to its destination
    const fileRelativePath = `${imageOwnerDir}/${fileSlug}.${fileExtension}`;
    file.mv(`${storagePath}/${fileRelativePath}`, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(fileRelativePath);
    });
  });
};

/**
 * Returns an object with `basename` and `extension` parts of given `fileName`.
 * Throws an error if file name does not have a basename or an extension.
 * @throws
 */
const getFileNameParts = (fileName: string) => {
  const parts = fileName.split(".");
  if (parts.length != 2) {
    throw new Error("Invalid file name");
  }

  return {
    basename: parts[0],
    extension: parts[1],
  };
};
