import mongoose from "mongoose";

export const ImageSchema = new mongoose.Schema({
  url: String,
});

export interface IImage extends mongoose.Document {
  url: string;
}

export default mongoose.model<IImage, mongoose.Model<IImage>>(
  "Image",
  ImageSchema
);
