import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Booking = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Booking date is required."],
    immutable: true,
  },
  status: { type: String, default: "pending" },
  comment: String,

  user: { type: "ObjectId", ref: "User" },
  item: {
    type: "ObjectId",
    ref: "Item",
    required: [true, "Booking item is required."],
  },

  createdAt: { type: Date, immutable: true, default: new Date() },
});

export interface IBooking extends mongoose.Document {
  date: Date;
  status: string;
  comment: string;

  user: ObjectId;
  item: ObjectId;

  createdAt: Date;
}

export default mongoose.model<IBooking, mongoose.Model<IBooking>>(
  "Booking",
  Booking
);
