import express from "express";
import * as itemsController from "../../controllers/items";
import * as itemInfosController from "../../controllers/itemInfos";
import * as itemPlacesController from "../../controllers/itemPlaces";
import { loadItemBySlug } from "../../middleware/models";

// create router
export const itemsRouter = express.Router({
  mergeParams: true,
});

// *** Item

itemsRouter.get("/", [itemsController.index]);
itemsRouter.post("/", [itemsController.insert]);
itemsRouter.get("/:slug", [loadItemBySlug("slug"), itemsController.get]);
itemsRouter.patch("/:slug", [loadItemBySlug("slug"), itemsController.update]);
itemsRouter.delete("/:slug", [loadItemBySlug("slug"), itemsController.remove]);

// *** Item infos

itemsRouter.post("/:slug/infos", [
  loadItemBySlug("slug"),
  itemInfosController.insert,
]);
itemsRouter.patch("/:slug/infos/:infoId", [
  loadItemBySlug("slug"),
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
