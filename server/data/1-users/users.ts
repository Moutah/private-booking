import faker from "faker";
import { users } from "../documentSeeds";

export = users.map((userSeed) => ({
  ...userSeed,

  name: faker.fake("{{name.firstName}} {{name.lastName}}"),
  email: faker.internet.email(),

  password: faker.random.alphaNumeric(64),
  hash: faker.random.alphaNumeric(64),

  token: faker.random.alphaNumeric(64),

  profileImage: null,
}));
