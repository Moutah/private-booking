import express from "express";
import * as postsController from "../../controllers/posts";
import { loadItemBySlug, loadPostById } from "../../middleware/models";
import { handleImageUpload } from "../../middleware/store-image";

// create router
export const postsRouter = express.Router({
  mergeParams: true,
});

postsRouter.get("/", [loadItemBySlug("itemSlug"), postsController.index]);
postsRouter.post("/", [
  loadItemBySlug("itemSlug"),
  handleImageUpload(),
  postsController.insert,
]);
postsRouter.get("/:postId", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.get,
]);
postsRouter.patch("/:postId", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.update,
]);
postsRouter.delete("/:postId", [
  loadItemBySlug("itemSlug"),
  loadPostById("postId"),
  postsController.remove,
]);
