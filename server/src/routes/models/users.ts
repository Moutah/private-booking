import express from "express";
import * as usersController from "../../controllers/users";
import { verifyUserIsAdmin } from "../../middleware/auth";
import {
  loadMeAsTargetUser,
  loadTargetUserById,
} from "../../middleware/models";
import { handleImageUpload } from "../../middleware/store-image";

// create routers
export const meRouter = express.Router({
  mergeParams: true,
});
export const usersRouter = express.Router({
  mergeParams: true,
});

meRouter.get("/", [loadMeAsTargetUser(), usersController.me]);
meRouter.patch("/", [
  loadMeAsTargetUser(),
  handleImageUpload(),
  usersController.update,
]);

usersRouter.patch("/:userId", [
  verifyUserIsAdmin(),
  loadTargetUserById("userId"),
  usersController.update,
]);
