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
  const response = await supertest(server.server)
    .get(url)
    .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
    .trustLocalhost();
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
  url: string,
  token?: string
) => async () => {
  // run a request that will not found
  const request = supertest(server.server);
  let action;
  switch (method) {
    case "POST":
      action = request.post(url);
      break;

    case "PATCH":
      action = request.patch(url);
      break;

    case "DELETE":
      action = request.delete(url);
      break;

    default:
    case "GET":
      action = request.get(url);
      break;
  }
  const response = await action
    .set("Authorization", "Bearer " + (token || process.env.TEST_TOKEN))
    .trustLocalhost();

  expect(response.status).toBe(404);
  expect(response.body).toBe("Not found");
};

/**
 * Mock the mongoose document `findById()` method to make it return the given
 * `modelMock` insted.
 * Don't forget to backup and restore the original findById()` method!
 */
export const mockFindById = (modelMock: any) =>
  jest.fn().mockReturnValue({
    exec: () => new Promise((resolve, reject) => resolve(modelMock)),
  });
