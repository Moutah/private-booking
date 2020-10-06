import express from "express";
import * as postsController from "../../controllers/posts";
import { loadItemBySlug, loadPostById } from "../../middleware/models";

// create router
export const postsRouter = express.Router({
  mergeParams: true,
});

postsRouter.get("/", [loadItemBySlug("itemSlug"), postsController.index]);
postsRouter.post("/", [loadItemBySlug("itemSlug"), postsController.insert]);
postsRouter.get("/:postId", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.get,
]);
postsRouter.post("/:postId", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.update,
]);
postsRouter.post("/:postId/delete", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.remove,
]);
