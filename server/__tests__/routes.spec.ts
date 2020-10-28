import express from "express";
import { webRoutes } from "../src/routes/web";

// mock express
jest.mock("express", () => {
  return {
    Router: () => ({
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn(),
    }),
    static: jest.fn((path: string) => path),
  };
});

describe("Routes", () => {
  describe("Web", () => {
    it("uses express.static assets paths set in env", () => {
      // call web routes consturctor
      const routes = webRoutes();

      expect(express.static).toHaveBeenCalledWith(
        process.env.CLIENT_PUBLIC_BUILD_PATH
      );
      expect(routes.use).toHaveBeenCalledWith(
        "/login",
        process.env.CLIENT_PUBLIC_BUILD_PATH
      );
      expect(express.static).toHaveBeenCalledWith(
        process.env.CLIENT_SECURE_BUILD_PATH
      );
      expect(routes.use).toHaveBeenCalledWith("/", [
        expect.anything(),
        process.env.CLIENT_SECURE_BUILD_PATH,
      ]);
      expect(express.static).toHaveBeenCalledWith(process.env.STORAGE_PATH);
      expect(routes.use).toHaveBeenCalledWith("/images", [
        expect.anything(),
        process.env.STORAGE_PATH,
      ]);
    });

    it("doesn't use express.static if assets paths not set in env", () => {
      // manually unset env
      delete process.env.CLIENT_PUBLIC_BUILD_PATH;
      delete process.env.CLIENT_SECURE_BUILD_PATH;
      delete process.env.STORAGE_PATH;

      // call web routes consturctor
      const routes = webRoutes();

      expect(express.static).not.toHaveBeenCalledWith(
        process.env.CLIENT_PUBLIC_BUILD_PATH
      );
      expect(routes.use).not.toHaveBeenCalledWith(
        process.env.CLIENT_PUBLIC_BUILD_PATH
      );
      expect(express.static).not.toHaveBeenCalledWith(
        process.env.CLIENT_SECURE_BUILD_PATH
      );
      expect(routes.use).not.toHaveBeenCalledWith(
        process.env.CLIENT_SECURE_BUILD_PATH
      );
      expect(express.static).not.toHaveBeenCalledWith(process.env.STORAGE_PATH);
      expect(routes.use).not.toHaveBeenCalledWith(
        "/images",
        process.env.STORAGE_PATH
      );
    });
  });
});
