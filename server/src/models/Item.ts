import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Item = new mongoose.Schema({
  name: String,

  iamges: [String],
  description: String,

  address: {
    street: String,
    zip: String,
    city: String,
    country: String,
    lat: Number,
    long: Number,
  },

  infos: [{ title: String, message: String, iamge: String }],

  places: [{ name: String, description: String, type: String }],

  equipment: [String],

  owner: ObjectId,
  managers: [ObjectId],
  bookings: [ObjectId],
});

export interface IItem extends mongoose.Document {
  name: String;

  iamges: [String];
  description: String;

  address: {
    street: String;
    zip: String;
    city: String;
    country: String;
    lat: Number;
    long: Number;
  };

  infos: [{ title: String; message: String; iamge: String }];

  places: [{ name: String; description: String; type: String }];

  equipment: [String];

  owner: ObjectId;
  managers: ObjectId[];
  bookings: ObjectId[];
}

export default mongoose.model<IItem, mongoose.Model<IItem>>("Item", Item);
