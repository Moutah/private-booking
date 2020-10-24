import Booking, { IBooking } from "../models/Booking";
import { IItem } from "../models/Item";
import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";

/**
 * Returns all bookings.
 */
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find({ item: req.item?._id });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * Inserts an booking in the database with values from the given `req.body`.
 */
export const insert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // create booking
    let booking = new Booking({
      ...req.body,
      item: req.item?._id,
      user: req.user?._id,
      createdAt: new Date(),
    });
    await booking.save();

    // return booking
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific booking from the database with id matching the one in given
 * `req.params`.
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(req.booking);
};

/**
 * Update a specific booking from the database with slug matching the one in given
 * `req.params` with the content in `req.body`.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestorId = req.user?._id as string;
    const item = req.item as IItem;
    let booking = req.booking as IBooking;

    // only author and item manager can update
    if (!booking.user.equals(requestorId) && !item.hasManager(requestorId)) {
      throw new ForbiddenError("Insufficient rights");
    }

    // update booking
    booking.status = req.body.status || booking.status;
    booking.comment = req.body.comment;
    await booking.save();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a specific booking from the database with slug matching the one in given
 * `req.params`.
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // remove booking
    await (req.booking as IBooking).remove();

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
