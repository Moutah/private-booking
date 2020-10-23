import express from "express";
import * as itemsController from "../../controllers/items";
import * as itemInfosController from "../../controllers/item-infos";
import * as itemPlacesController from "../../controllers/item-places";
import {
  loadItemBySlug,
  loadMeAsTargetUser,
  loadTargetUserById,
} from "../../middleware/models";
import { handleImageUpload } from "../../middleware/store-image";

// create router
export const itemsRouter = express.Router({
  mergeParams: true,
});

// *** Item

itemsRouter.get("/", [itemsController.index]);
itemsRouter.post("/", [loadMeAsTargetUser(), itemsController.insert]);
itemsRouter.get("/:slug", [loadItemBySlug("slug"), itemsController.get]);
itemsRouter.patch("/:slug", [
  loadItemBySlug("slug"),
  handleImageUpload(),
  itemsController.update,
]);
itemsRouter.post("/:slug/unregister", [
  loadItemBySlug("slug"),
  loadMeAsTargetUser(),
  itemsController.unregister,
]);
itemsRouter.post("/:slug/ban/:userId", [
  loadItemBySlug("slug"),
  loadTargetUserById("userId"),
  itemsController.unregister,
]);
itemsRouter.delete("/:slug", [loadItemBySlug("slug"), itemsController.remove]);

// *** Item infos

itemsRouter.post("/:slug/infos", [
  loadItemBySlug("slug"),
  handleImageUpload(),
  itemInfosController.insert,
]);
itemsRouter.patch("/:slug/infos/:infoId", [
  loadItemBySlug("slug"),
  handleImageUpload(),
  itemInfosController.update,
]);
itemsRouter.delete("/:slug/infos/:infoId", [
  loadItemBySlug("slug"),
  itemInfosController.remove,
]);

// *** Item places

itemsRouter.post("/:slug/places", [
  loadItemBySlug("slug"),
  itemPlacesController.insert,
]);
itemsRouter.patch("/:slug/places/:placeId", [
  loadItemBySlug("slug"),
  itemPlacesController.update,
]);
itemsRouter.delete("/:slug/places/:placeId", [
  loadItemBySlug("slug"),
  itemPlacesController.remove,
]);
