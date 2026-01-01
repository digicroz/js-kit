import { describe, it, expect } from "vitest";
import { isValidName, normalizeName, zodNameValidation, zodNameTransform } from "./index";

describe("name utilities", () => {
  describe("isValidName", () => {
    it("should allow alphanumeric characters", () => {
      expect(isValidName("JohnDoe")).toBe(true);
      expect(isValidName("JohnDoe123")).toBe(true);
    });

    it("should allow single spaces by default", () => {
      expect(isValidName("John Doe")).toBe(true);
    });

    it("should reject consecutive spaces", () => {
      expect(isValidName("John  Doe")).toBe(false);
    });

    it("should reject leading/trailing spaces", () => {
      expect(isValidName(" John Doe")).toBe(false);
      expect(isValidName("John Doe ")).toBe(false);
    });

    it("should handle custom special characters", () => {
      const options = { allowedSpecialChars: [".", "-"] };
      expect(isValidName("John.Doe", options)).toBe(true);
      expect(isValidName("John-Doe", options)).toBe(true);
      expect(isValidName("John.-Doe", options)).toBe(false); // Consecutive
      expect(isValidName("John..Doe", options)).toBe(false);
      expect(isValidName(".John", options)).toBe(false);
    });
  });

  describe("normalizeName", () => {
    it("should trim whitespace", () => {
      expect(normalizeName("  John Doe  ")).toBe("John Doe");
    });

    it("should collapse consecutive special chars", () => {
      expect(normalizeName("John  Doe")).toBe("John Doe");
      expect(normalizeName("John...Doe", { allowedSpecialChars: ["."] })).toBe("John.Doe");
    });

    it("should remove invalid characters", () => {
      expect(normalizeName("John@Doe")).toBe("JohnDoe");
    });

    it("should handle mix of special chars collision", () => {
       // " . " -> space and dot allowed. Collapses to first one encountered?
       expect(normalizeName("John . Doe", { allowedSpecialChars: [" ", "."] })).toBe("John Doe");
    });

    it("should normalize filename-like strings with spaces and dots", () => {
      expect(
        normalizeName("  Test   File.text    ", { allowedSpecialChars: [" ", "."] })
      ).toBe("Test File.text");
    });

    it("should handle hyphens in allowedSpecialChars correctly (bug fix regression)", () => {
      const input = "WhatsApp Image 2025-11-29 at 23.42.33.jpeg";
      const options = {
          allowedSpecialChars: [" ", "-", "_", "."],
      };
      // Should preserve alphanumeric characters and allow allowed special chars
      // And collapse consecutive ones.
      // "WhatsApp Image 2025-11-29 at 23.42.33.jpeg"
      // Spaces, dashes, dots are allowed.
      expect(normalizeName(input, options)).toBe("WhatsApp Image 2025-11-29 at 23.42.33.jpeg");
    });
  });

  describe("zod integration", () => {
     it("should validate with zod helper", () => {
         const validate = zodNameValidation();
         expect(validate("John Doe")).toBe(true);
         expect(validate("John  Doe")).toBe(false);
     });

     it("should transform with zod helper", () => {
         const transform = zodNameTransform();
         expect(transform("  John   Doe  ")).toBe("John Doe");
     });
  });
});
