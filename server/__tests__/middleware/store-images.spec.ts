import fs from "fs";
import Item, { IItem } from "../../src/models/Item";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { NextFunction, Request, Response } from "express";
import * as storeImage from "../../src/middleware/store-image";
import { handleErrorJson } from "../../src/middleware/error";
import supertest from "supertest";
import fileUpload from "express-fileupload";

let fileMvMock: (path: string, callback?: (err: any) => void) => Promise<void>;
let requestResult: Request;

const fakeItem = new Item({ name: "fake item", slug: "fake-item" });
const fakeItemStoragePath = `../storage/${fakeItem.slug}`;

/**
 * Creates and returns a test server that handles `POST "/"` requests with the
 * following stack:
 * 1) inject `fakeItem` in `req.item`
 * 2) use `handleImageUpload`
 * 3) sets the state of `req` to `requestResult`
 * 4) returns empty
 *
 * The server also uses `handleError` middleware.
 */
const makeTestServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
      createParentPath: true,
    })
  );
  app.use(handleErrorJson);

  app.post("/", [
    // hijack req files mv function with fileMvMock if set
    (req: Request, res: Response, next: NextFunction) => {
      if (fileMvMock && req.files) {
        req.files.images.mv = fileMvMock;
      }
      next();
    },

    // inject fake item into `req.item`
    (req: Request, res: Response, next: NextFunction) => {
      req.item = fakeItem;
      next();
    },

    // hangle image uploade middleware
    storeImage.handleImageUpload(),

    // expose current state of request
    (req: Request, res: Response, next: NextFunction) => {
      requestResult = req;
      res.send();
    },
  ]);

  return app;
};

describe("Store image middleware", () => {
  // create test server at begining of tests
  let testServer: Express;
  beforeAll(() => {
    testServer = makeTestServer();
  });

  // clear fake item storage after each test
  afterEach(() => {
    if (fs.existsSync(fakeItemStoragePath)) {
      fs.rmdirSync(fakeItemStoragePath, { recursive: true });
    }
  });

  it("can handle request with no image upload", async () => {
    // simulate request without images file
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN);
    expect(requestResult.body.hasOwnProperty("images")).toBe(false);
  });

  it("can handle single image upload", async () => {
    // run a request with image
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol.jpg");

    // validate image has been added to the request
    expect(requestResult.body.images).toBeTruthy();
    expect(requestResult.body.images).toStrictEqual([
      `/images/${fakeItem.slug}/lol.jpg`,
    ]);

    // validate file has been stored correctly
    const isFileExist = fs.existsSync(`${fakeItemStoragePath}/lol.jpg`);
    expect(isFileExist).toBe(true);
  });

  it("can handle single image upload with one other images array", async () => {
    // run a request with one other image
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .field("images", ["/first/image/url.jpg"])
      .attach("images", "__tests__/images/lol.jpg");

    // validate image has been added to the request
    expect(requestResult.body.images).toBeTruthy();
    expect(requestResult.body.images).toStrictEqual([
      "/first/image/url.jpg",
      `/images/${fakeItem.slug}/lol.jpg`,
    ]);
  });

  it("can handle single image upload with multiple images array", async () => {
    // run a request with two other images
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .field("images", ["/first/image/url.jpg", "/second/image/url.jpg"])
      .attach("images", "__tests__/images/lol.jpg");

    // validate image has been added to the request
    expect(requestResult.body.images).toBeTruthy();
    expect(requestResult.body.images).toStrictEqual([
      "/first/image/url.jpg",
      "/second/image/url.jpg",
      `/images/${fakeItem.slug}/lol.jpg`,
    ]);
  });

  it("won't process non-image files", async () => {
    // run a request with non-image file
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol.pdf");

    // validate image has been added to the request
    expect(requestResult.body.hasOwnProperty("images")).toBe(false);
  });

  it("can store image with same name", async () => {
    // run a request with same image twice
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol.jpg");
    await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol.jpg");

    // validate image slug has been added to the request
    expect(requestResult.body.images).toBeTruthy();
    expect(requestResult.body.images).toStrictEqual([
      `/images/${fakeItem.slug}/lol-1.jpg`,
    ]);

    // validate files have been stored correctly
    const isFilesExist =
      fs.existsSync(`${fakeItemStoragePath}/lol.jpg`) &&
      fs.existsSync(`${fakeItemStoragePath}/lol-1.jpg`);
    expect(isFilesExist).toBe(true);
  });

  it("returns server error if file name is invalid", async () => {
    // run a request with image name that has no extension
    let response = await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol");

    // validate that server error is thrown
    expect(response.status).toBe(500);

    // run a request with image name that has no name
    response = await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/.jpg");

    // validate that server error is thrown
    expect(response.status).toBe(500);
  });

  it("returns server error if file move fails", async () => {
    // hijack file.mv
    fileMvMock = (path: string, callback?: (err: any) => void) =>
      new Promise((resolve, reject) => {
        if (!callback) {
          reject(new Error("Test MV Error"));
          return;
        }
        callback(new Error("Test MV Error"));
      });

    // run a request with image
    const response = await supertest(testServer)
      .post("/")
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .attach("images", "__tests__/images/lol.jpg");

    // validate that server error is thrown
    expect(response.status).toBe(500);
  });
});
