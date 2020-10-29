import { IBooking } from "../../models/Booking";
import { IItem } from "../../models/Item";
import { IPost } from "../../models/Post";
import { IUser } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      booking?: IBooking;
      item?: IItem;
      post?: IPost;
      targetUser?: IUser;
    }

    interface User {
      _id: string;
    }

    interface AuthInfo {
      action?: string;
      hash?: string;
    }
  }
}
