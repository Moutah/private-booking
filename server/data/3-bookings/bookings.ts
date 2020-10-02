import faker from "faker";
import { bookings } from "../documentSeeds";

export = bookings.map((bookingSeed) => ({
  ...bookingSeed,

  date: Math.random() > 0.5 ? faker.date.future() : faker.date.past(),
  status: Math.random() > 0.5 ? "pending" : "confirmed",
  comment: faker.lorem.sentence(),
}));
