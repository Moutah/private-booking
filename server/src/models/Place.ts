import mongoose from "mongoose";

export const PlaceSchema = new mongoose.Schema({
  name: { type: "String", required: [true, "Place name is required."] },
  description: {
    type: "String",
    required: [true, "Place description is required."],
  },
  type: String,
});

export interface IPlace extends mongoose.Document {
  name: string;
  description: string;
  type: string;
}

export default mongoose.model<IPlace, mongoose.Model<IPlace>>(
  "Place",
  PlaceSchema
);
