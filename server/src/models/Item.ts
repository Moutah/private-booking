import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { nextAvailableSlug } from "./helpers";

const Item = new mongoose.Schema({
  name: { type: "String", required: [true, "Item name required"] },
  slug: { type: "String", required: true, index: { unique: true } },

  images: [String],
  description: String,

  address: {
    street: String,
    zip: String,
    city: String,
    country: String,
    lat: Number,
    long: Number,
  },

  infos: [{ title: String, message: String, image: String }],

  places: [{ name: String, description: String, type: String }],

  equipment: [String],

  owner: {
    type: "ObjectId",
    ref: "User",
  },
  managers: [{ type: "ObjectId", ref: "User" }],
  bookings: [{ type: "ObjectId", ref: "Booking" }],
});

export interface IItem extends mongoose.Document {
  name: string;
  slug: string;

  images: [string];
  description: string;

  address: {
    street: string;
    zip: string;
    city: string;
    country: string;
    lat: Number;
    long: Number;
  };

  infos: [{ title: string; message: string; image: string }];

  places: [{ name: string; description: string; type: string }];

  equipment: [string];

  owner: ObjectId;
  managers: ObjectId[];
  bookings: ObjectId[];
}

Item.pre<IItem>("save", async function (next) {
  // set new items' slug to the next available one
  if (this.isModified("slug")) {
    const itemsWithSameName = await ItemModel.find({ name: this.name }).select(
      "slug"
    );
    const slugs = itemsWithSameName.map((doc) => doc.slug);
    this.slug = nextAvailableSlug(this.slug, slugs);
  }

  next();
});

const ItemModel = mongoose.model<IItem, mongoose.Model<IItem>>("Item", Item);

export default ItemModel;
