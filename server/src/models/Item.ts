import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { nextAvailableSlug } from "../helpers";
import { NotFoundError } from "../errors";
import { IInfo, InfoSchema } from "./Info";
import { IPlace, PlaceSchema } from "./Place";

// schema
const ItemSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: [true, "Item name is required."],
    immutable: true,
  },
  slug: {
    type: "String",
    required: [true, "Item slug is required."],
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

  infos: [InfoSchema],

  places: [PlaceSchema],

  equipments: [String],

  owner: { type: "ObjectId", ref: "User" },
  managers: [{ type: "ObjectId", ref: "User" }],
});

// interface
export interface IItem extends mongoose.Document {
  name: string;
  slug: string;

  images: string[];
  description: string;

  address: {
    street: string;
    zip: string;
    city: string;
    country: string;
    lat: Number;
    long: Number;
  };

  infos: mongoose.Types.DocumentArray<IInfo>;

  places: mongoose.Types.DocumentArray<IPlace>;

  equipments: string[];

  owner: ObjectId;
  managers: ObjectId[];
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
