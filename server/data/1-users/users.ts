import bcrypt from "bcrypt";
import faker from "faker";
import { users } from "../documentSeeds";

export = users.map((userSeed) => ({
  ...userSeed,

  name: faker.fake("{{name.firstName}} {{name.lastName}}"),
  email: faker.internet.email(),

  password: "$2y$10$MyNu21GNrGJBg6AutUPbWett0r8Rb.BDv6R08z1r4u0EYGr0KPZIm", // password

  profileImage: null,
}));
