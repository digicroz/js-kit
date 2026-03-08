import { describe, it, expect } from "vitest";
import { stdResponse } from ".";

describe("stdResponse", () => {
  describe("success", () => {
    it("should create a success response", () => {
      const data = { id: 1, name: "Test" };
      const response = stdResponse.success(data);

      expect(response).toEqual({
        status: "success",
        result: data,
      });
    });
  });

  describe("error", () => {
    it("should create an error response without message", () => {
      const code = "INTERNAL_ERROR";
      const response = stdResponse.error(code);

      expect(response).toEqual({
        status: "error",
        error: {
          code,
          message: undefined,
        },
      });
    });

    it("should create an error response with message", () => {
      const code = "VALIDATION_ERROR";
      const message = "Validation failed";
      const response = stdResponse.error(code, message);

      expect(response).toEqual({
        status: "error",
        error: {
          code,
          message,
        },
      });
    });

    it("should create an error response with details", () => {
      const code = "validation_error";
      const message = "Invalid input";
      const details = { field: "email", reason: "invalid format" };
      const response = stdResponse.error(code, message, details);

      expect(response).toEqual({
        status: "error",
        error: {
          code,
          message,
          details,
        },
      });
    });
  });
});
