import Post from "../models/Post";
import Item from "../models/Item";
import { Request, Response } from "express";
import { returnError } from "./helpers";
import { NotFoundError } from "./not-found-error";

/**
 * Returns all posts.
 */
export const index = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.itemSlug);

    const posts = await Post.find({ item: item._id });
    res.json(posts);
  } catch (err) {
    res = returnError("posts.index", err, res);
  }
};

/**
 * Inserts an post in the database with values from the given `req` body.
 */
export const insert = async (req: Request, res: Response) => {
  try {
    let item = await Item.findBySlug(req.params.itemSlug);

    // create post
    let post = new Post({
      ...req.body,
      item: item._id,
      date: new Date(),
    });
    await post.save();

    // return post
    res.status(201).json(post);
  } catch (err) {
    res = returnError("posts.insert", err, res);
  }
};

/**
 * Get a specific post from the database with slug matching the one in given
 * `req`.
 */
export const get = async (req: Request, res: Response) => {
  try {
    let post = await Post.findById(req.params.postId);

    if (!post) {
      throw new NotFoundError();
    }

    res.status(200).json(post);
  } catch (err) {
    res = returnError("posts.get", err, res);
  }
};

/**
 * Update a specific post from the database with slug matching the one in given
 * `req.params` with the content in `req.body`.
 */
export const update = async (req: Request, res: Response) => {
  try {
    let post = await Post.findById(req.params.postId);

    if (!post) {
      throw new NotFoundError();
    }

    // update post
    post.message = req.body.message;
    await post.save();

    res.status(200).send();
  } catch (err) {
    res = returnError("posts.update", err, res);
  }
};

/**
 * Remove a specific post from the database with slug matching the one in given
 * `req.params`.
 */
export const remove = async (req: Request, res: Response) => {
  try {
    let post = await Post.findById(req.params.postId);

    if (!post) {
      throw new NotFoundError();
    }

    // remove post
    await post.remove();

    res.status(200).send();
  } catch (err) {
    res = returnError("posts.remove", err, res);
  }
};
