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
  pathRelativeToClientBuild: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const filePath = path.resolve(
      `${process.env.CLIENT_BUILD_PATH}/${pathRelativeToClientBuild}`
    );

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });

describe("Pages", () => {
  it("injects user's JWT on main page and displays it", async () => {
    const indexContent = (await getClientDistFileContent("index.html")).replace(
      "</head>",
      `<meta name="token" value="user-jwt-token"></head>`
    );
    await pagesController.main(mockRequest, mockResponse, mockNext);
    expect(mockRequest.user.createJWT).toHaveBeenCalled();
    expect(mockResponse.send).toHaveBeenCalledWith(indexContent);
  });

  it("can display login page", async () => {
    const loginContent = await getClientDistFileContent("login.html");
    await pagesController.login({} as Request, mockResponse, mockNext);
    expect(mockResponse.send).toHaveBeenCalledWith(loginContent);
  });

  it("can display register page", async () => {
    const registerContent = await getClientDistFileContent("register.html");
    await pagesController.register({} as Request, mockResponse, mockNext);
    expect(mockResponse.send).toHaveBeenCalledWith(registerContent);
  });

  it("can handle fs error", async () => {
    // rename file so that they'll be missing
    fs.renameSync(
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/index.html`),
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/index-is-missing.html`)
    );
    fs.renameSync(
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/login.html`),
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/login-is-missing.html`)
    );

    await pagesController.main({} as Request, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    await pagesController.login({} as Request, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    // restore main file
    fs.renameSync(
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/index-is-missing.html`),
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/index.html`)
    );
    fs.renameSync(
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/login-is-missing.html`),
      path.resolve(`${process.env.CLIENT_BUILD_PATH}/login.html`)
    );
  });
});
