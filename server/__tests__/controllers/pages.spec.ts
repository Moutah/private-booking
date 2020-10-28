/* tslint:disable */
import * as pagesController from "../../src/controllers/pages";
import { Request } from "express";
import path from "path";
import fs from "fs";

// express mocks
const mockRequest: any = {
  user: {
    createJWT: jest.fn(() => "user-jwt-token"),
  },
};
const mockResponse: any = {
  send: jest.fn(),
};
const mockNext = jest.fn();

/**
 * Reads the file at given `pathRelativeToClientBuild` returns its content.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<string>}
 */
const getClientDistFileContent = async (
  clientBuild: string,
  pathRelativeToClientBuild: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const buildDir =
      clientBuild === "secure"
        ? process.env.CLIENT_SECURE_BUILD_PATH
        : process.env.CLIENT_PUBLIC_BUILD_PATH;
    const filePath = path.resolve(`${buildDir}/${pathRelativeToClientBuild}`);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });

describe("Pages", () => {
  it("injects user's JWT on main page and displays it", async () => {
    const mainContent = await getClientDistFileContent("secure", "index.html");
    await pagesController.main({} as Request, mockResponse, mockNext);
    expect(mockResponse.send).toHaveBeenCalledWith(mainContent);
  });

  it("can display login page", async () => {
    const loginContent = await getClientDistFileContent("public", "index.html");
    await pagesController.login({} as Request, mockResponse, mockNext);
    expect(mockResponse.send).toHaveBeenCalledWith(loginContent);
  });

  it("can handle fs error", async () => {
    // rename file so that they'll be missing
    fs.renameSync(
      path.resolve(`${process.env.CLIENT_PUBLIC_BUILD_PATH}/index.html`),
      path.resolve(
        `${process.env.CLIENT_PUBLIC_BUILD_PATH}/index-is-missing.html`
      )
    );

    await pagesController.login({} as Request, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // restore file
    fs.renameSync(
      path.resolve(
        `${process.env.CLIENT_PUBLIC_BUILD_PATH}/index-is-missing.html`
      ),
      path.resolve(`${process.env.CLIENT_PUBLIC_BUILD_PATH}/index.html`)
    );
  });
});
