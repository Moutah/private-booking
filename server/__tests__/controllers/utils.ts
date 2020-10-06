import supertest from "supertest";
import * as server from "../../src/server";

/**
 * Test that a call to given `url` with given `method` handles a server error
 * properly. To simulate a server error, the `failMethod` of given `obj` is
 * hijacked to throw an Error.
 */
export const testServerErrorHandling = (
  method: string,
  url: string,
  obj: any,
  failMethod: string
) => async () => {
  // hijack Item.findBySlug to have a server error and console.log to mute
  jest.spyOn(obj, failMethod).mockImplementationOnce(() => {
    throw new Error("TEST server error");
  });
  jest.spyOn(console, "error").mockImplementationOnce(() => {});

  // run a request that will fail
  const request = supertest(server.server);
  const response = await (method.toLowerCase() === "post"
    ? request.post(url)
    : request.get(url)
  ).trustLocalhost();

  expect(response.status).toBe(500);
};

/**
 * Test that a call to given `url` with given `method` handles a not found
 * error properly.
 * @param method
 * @param url
 */
export const testNotFoundErrorHandling = (
  method: string,
  url: string
) => async () => {
  // run a request that will not found
  const request = supertest(server.server);
  const response = await (method.toLowerCase() === "post"
    ? request.post(url)
    : request.get(url)
  ).trustLocalhost();
  expect(response.status).toBe(404);
  expect(response.body).toBe("Not found");
};
