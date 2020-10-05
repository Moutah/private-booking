import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { nextAvailableSlug } from "./helpers";
import { NotFoundError } from "../controllers/not-found-error";

// schema
const ItemSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: [true, "Item name required"],
    immutable: true,
  },
  slug: {
    type: "String",
    required: true,
    index: { unique: true },
    immutable: true,
  },

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

  equipments: [String],

  owner: {
    type: "ObjectId",
    ref: "User",
  },
  managers: [{ type: "ObjectId", ref: "User" }],
  bookings: [{ type: "ObjectId", ref: "Booking" }],
});

// interface
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

  equipments: [string];

  owner: ObjectId;
  managers: ObjectId[];
  bookings: ObjectId[];
}

// static methods
ItemSchema.statics.findBySlug = async function (slug: string): Promise<IItem> {
  const item = await this.findOne({ slug }).populate("managers").exec();

  if (!item) {
    throw new NotFoundError();
  }

  return item;
};

// document middleware
ItemSchema.pre<IItem>("save", async function (next) {
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

// model
const ItemModel = mongoose.model<IItem, IItemModel>("Item", ItemSchema);
export interface IItemModel extends mongoose.Model<IItem> {
  /**
   * Find the item with given `slug`.
   * @throws NotFoundError
   */
  findBySlug(slug: string): Promise<IItem>;
}

export default ItemModel;
