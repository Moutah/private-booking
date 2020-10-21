// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "User name is required."] },
  profileImage: String,

  email: {
    type: String,
    required: [true, "User email is required."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "User password is required."],
    select: false,
  },

  token: { type: String, select: false },

  items: [{ type: "ObjectId", ref: "Item" }],
});

// interface
export interface IUser extends mongoose.Document {
  name: string;
  profileImage: string[];

  email: string;
  password: string;

  token: string;

  items: ObjectId[];

  isPasswordValid: boolean;
}

// methods
UserSchema.methods.isPasswordValid = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// document middleware
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

export default mongoose.model<IUser, mongoose.Model<IUser>>("User", UserSchema);
