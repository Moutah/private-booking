import express from "express";
import * as bookingsController from "../../controllers/bookings";
import { loadItemBySlug, loadBookingById } from "../../middleware/models";

// create router
export const bookingsRouter = express.Router({
  mergeParams: true,
});

bookingsRouter.get("/", [loadItemBySlug("itemSlug"), bookingsController.index]);
bookingsRouter.post("/", [
  loadItemBySlug("itemSlug"),
  bookingsController.insert,
]);
bookingsRouter.get("/:bookingId", [
  loadItemBySlug("itemSlug"),
  loadBookingById("bookingId"),
  bookingsController.get,
]);
bookingsRouter.post("/:bookingId", [
  loadItemBySlug("itemSlug"),
  loadBookingById("bookingId"),
  bookingsController.update,
]);
bookingsRouter.post("/:bookingId/delete", [
  loadItemBySlug("itemSlug"),
  loadBookingById("bookingId"),
  bookingsController.remove,
]);
