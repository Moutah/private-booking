import mongoose from "mongoose";

export const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
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
