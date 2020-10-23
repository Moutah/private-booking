import { IBooking } from "../../models/Booking";
import { IItem } from "../../models/Item";
import { IPost } from "../../models/Post";

declare global {
  namespace Express {
    interface Request {
      booking?: IBooking;
      item?: IItem;
      post?: IPost;
    }

    interface User {
      _id: string;
    }
  }
}
