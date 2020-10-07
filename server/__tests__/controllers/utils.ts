import supertest from "supertest";
import * as server from "../../src/server";

/**
 * Test that a GET call to given `url` handles a server error  properly. To
 * simulate a server error, the `failMethod` of given `obj` is hijacked to
 * throw an Error.
 */
export const testServerErrorHandling = (
  url: string,
  obj: any,
  failMethod: string
) => async () => {
  // hijack Item.findBySlug to have a server error
  jest.spyOn(obj, failMethod).mockImplementationOnce(() => {
    throw new Error("TEST server error");
  });

  // mute console
  jest.spyOn(console, "error").mockImplementationOnce(() => {});

  // run a request that will fail
  const response = await supertest(server.server).get(url).trustLocalhost();
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
  let response;
  switch (method) {
    case "POST":
      response = await request.post(url).trustLocalhost();
      break;

    case "PATCH":
      response = await request.patch(url).trustLocalhost();
      break;

    case "DELETE":
      response = await request.delete(url).trustLocalhost();
      break;

    default:
    case "GET":
      response = await request.get(url).trustLocalhost();
      break;
  }

  expect(response.status).toBe(404);
  expect(response.body).toBe("Not found");
};
