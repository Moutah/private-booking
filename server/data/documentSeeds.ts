import { getObjectId } from "mongo-seeding";
import { ObjectId } from "mongodb";
import faker from "faker";

export const USERS_COUNT = 12;
export const ITEMS_COUNT = 12;
export const BOOKINGS_COUNT = 48;
export const POSTS_COUNT = 48;

// *** init seeds

export let users: {
  _id: ObjectId;
  items: ObjectId[];
  bookings: ObjectId[];
}[] = [...Array(USERS_COUNT).keys()].map((i) => ({
  _id: getObjectId(`users${i}`),
  items: [],
  bookings: [],
}));

export let items: {
  _id: ObjectId;
  owner: ObjectId | null;
  managers: ObjectId[];
}[] = [...Array(ITEMS_COUNT).keys()].map((i) => ({
  _id: getObjectId(`items${i}`),
  owner: null,
  managers: [],
}));

export let bookings: {
  _id: ObjectId;
  user: ObjectId | null;
  item: ObjectId | null;
}[] = [...Array(BOOKINGS_COUNT).keys()].map((i) => ({
  _id: getObjectId(`bookings${i}`),
  user: null,
  item: null,
}));

export let posts: {
  _id: ObjectId;
  author: ObjectId | null;
  item: ObjectId | null;
}[] = [...Array(POSTS_COUNT).keys()].map((i) => ({
  _id: getObjectId(`posts${i}`),
  author: null,
  item: null,
}));

export const calcBindings = () => {
  // shuffle seed
  faker.seed(Date.now());

  // items
  items = items.map((item) => {
    // get some users
    const itemUserIds = getIdsUpTo("users", 4);

    return {
      ...item,

      owner: itemUserIds[0],
      managers: itemUserIds,
      bookings: [],
    };
  });

  // users
  users = users.map((user) => {
    // get some items
    const userItemIds = getIdsUpTo("items", 6);

    // and items for which the user is manager
    const userItemManagedIds = items
      .filter((item) => item.managers.includes(user._id))
      .map((item) => item._id);

    return {
      ...user,

      items: Array.from(new Set([...userItemIds, ...userItemManagedIds])),
      bookings: [],
    };
  });

  // bookings
  bookings = bookings.map((booking) => {
    // pick a user
    const user = faker.random.arrayElement(users);

    // pick one of its items
    const itemId = faker.random.arrayElement(user.items);

    // there you go
    return {
      ...booking,

      user: user._id,
      item: itemId,
    };
  });

  // posts
  posts = posts.map((post) => {
    // pick a user
    const user = faker.random.arrayElement(users);

    // pick one of its items
    const itemId = faker.random.arrayElement(user.items);

    // there you go
    return {
      ...post,

      user: user._id,
      item: itemId,
    };
  });
};

const getIdsUpTo = (documentType: string, maxCount: number): ObjectId[] => {
  let documentCount = 0;
  switch (documentType) {
    case "items":
      documentCount = ITEMS_COUNT;
      break;

    case "users":
      documentCount = USERS_COUNT;
      break;

    case "bookings":
      documentCount = BOOKINGS_COUNT;
      break;

    case "posts":
      documentCount = POSTS_COUNT;
      break;

    default:
      return [];
  }

  const documentIds = [...Array(documentCount).keys()].map((i) =>
    getObjectId(documentType + i)
  );
  const count = Math.ceil(Math.random() * maxCount);
  const selection: ObjectId[] = [];

  for (let i = 0; i < count; i++) {
    selection.push(
      documentIds.splice(Math.floor(Math.random() * documentIds.length), 1)[0]
    );
  }

  return selection;
};
