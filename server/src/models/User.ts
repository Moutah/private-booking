// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import jsonwebtoken from "jsonwebtoken";
import { TOKEN_LIFESPAN } from "../auth";

// schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "User name is required."] },
  profileImage: String,

  email: {
    type: String,
    required: [true, "User email is required."],
    unique: true,
  },
  password: { type: String, select: false },

  isAdmin: { type: Boolean, default: false },

  items: [{ type: "ObjectId", ref: "Item" }],
});

// interface
export interface IUser extends mongoose.Document {
  name: string;
  profileImage: string;

  email: string;
  password: string;

  isAdmin: boolean;

  items: ObjectId[];

  /**
   * Check that given `password` matches the one stored for this user.
   */
  isPasswordValid: (password: string) => Promise<boolean>;

  /**
   * Creates a JWT for this user.
   */
  createJWT: () => string;

  /**
   * Returns `true` if given `itemId` is accessible to this user. Returns
   * `false` otherwise.
   */
  hasAccessToItem: (itemId: ObjectId | string) => boolean;
}

// *** Methods

UserSchema.methods.isPasswordValid = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createJWT = function (): string {
  return jsonwebtoken.sign(
    {
      sub: this._id,
      name: this.name,
      picture: this.profileImage,
      email: this.email,
      scope: this.isAdmin ? "Full" : "Write",
      aud: process.env.APP_URL,
    },
    process.env.APP_KEY as string,
    { expiresIn: TOKEN_LIFESPAN }
  );
};

UserSchema.methods.hasAccessToItem = function (
  itemId: ObjectId | string
): boolean {
  return this.items.some((_itemId: ObjectId) => _itemId.equals(itemId));
};

// document middleware
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

export default mongoose.model<IUser, mongoose.Model<IUser>>("User", UserSchema);
