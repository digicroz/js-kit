import { describe, it, expect } from "vitest"
import {
  isValidSlug,
  convertToSlug,
  generateUniqueSlug,
  zodSlugValidation,
  zodSlugTransform,
  slugSchema,
  autoSlugSchema,
} from "./index"

describe("slug utilities", () => {
  describe("isValidSlug", () => {
    it("should validate correct slug", () => {
      expect(isValidSlug("hello-world")).toBe(true)
      expect(isValidSlug("hello-world-123")).toBe(true)
      expect(isValidSlug("test123")).toBe(true)
    })

    it("should reject uppercase letters", () => {
      expect(isValidSlug("Hello-World")).toBe(false)
      expect(isValidSlug("HELLO")).toBe(false)
    })

    it("should reject consecutive hyphens", () => {
      expect(isValidSlug("hello--world")).toBe(false)
      expect(isValidSlug("hello---world")).toBe(false)
    })

    it("should reject leading hyphen", () => {
      expect(isValidSlug("-hello-world")).toBe(false)
      expect(isValidSlug("--hello")).toBe(false)
    })

    it("should reject trailing hyphen", () => {
      expect(isValidSlug("hello-world-")).toBe(false)
      expect(isValidSlug("hello--")).toBe(false)
    })

    it("should reject underscores", () => {
      expect(isValidSlug("hello_world")).toBe(false)
    })

    it("should reject special characters", () => {
      expect(isValidSlug("hello@world")).toBe(false)
      expect(isValidSlug("hello world")).toBe(false)
      expect(isValidSlug("hello!world")).toBe(false)
    })

    it("should reject empty string", () => {
      expect(isValidSlug("")).toBe(false)
    })

    it("should reject non-string input", () => {
      expect(isValidSlug(null as any)).toBe(false)
      expect(isValidSlug(undefined as any)).toBe(false)
      expect(isValidSlug(123 as any)).toBe(false)
    })

    it("should accept single character", () => {
      expect(isValidSlug("a")).toBe(true)
      expect(isValidSlug("1")).toBe(true)
    })

    describe("with allowDots option", () => {
      it("should valid slug with dots", () => {
        expect(isValidSlug("file.txt", { allowDots: true })).toBe(true)
        expect(isValidSlug("archive.tar.gz", { allowDots: true })).toBe(true)
        expect(isValidSlug("version.1.0.0", { allowDots: true })).toBe(true)
      })

      it("should reject dots when allowDots is false (default)", () => {
        expect(isValidSlug("file.txt")).toBe(false)
        expect(isValidSlug("file.txt", { allowDots: false })).toBe(false)
      })

      it("should reject consecutive separators including dots", () => {
        expect(isValidSlug("file..txt", { allowDots: true })).toBe(false)
        expect(isValidSlug("file.-txt", { allowDots: true })).toBe(false)
        expect(isValidSlug("file-.txt", { allowDots: true })).toBe(false)
      })

      it("should reject leading/trailing dots", () => {
        expect(isValidSlug(".file", { allowDots: true })).toBe(false)
        expect(isValidSlug("file.", { allowDots: true })).toBe(false)
      })
    })
  })

  describe("convertToSlug", () => {
    it("should convert text to slug", () => {
      expect(convertToSlug("Hello World")).toBe("hello-world")
      expect(convertToSlug("Hello  World!!!")).toBe("hello-world")
    })

    it("should handle accents and diacritics", () => {
      expect(convertToSlug("Café & Restaurant")).toBe("cafe-restaurant")
      expect(convertToSlug("Niño")).toBe("nino")
    })

    it("should handle special characters", () => {
      expect(convertToSlug("Product #123")).toBe("product-123")
      expect(convertToSlug("Hello@World!")).toBe("helloworld")
    })

    it("should trim whitespace", () => {
      expect(convertToSlug("  Hello World  ")).toBe("hello-world")
    })

    it("should handle consecutive separators", () => {
      expect(convertToSlug("Hello---World")).toBe("hello-world")
      expect(convertToSlug("Hello___World")).toBe("hello-world")
    })

    it("should return empty string for invalid input", () => {
      expect(convertToSlug("")).toBe("")
      expect(convertToSlug(null as any)).toBe("")
      expect(convertToSlug(undefined as any)).toBe("")
    })

    it("should handle custom separator", () => {
      expect(convertToSlug("Hello World", { separator: "_" })).toBe(
        "hello_world"
      )
    })

    it("should handle underscores", () => {
      expect(convertToSlug("Hello_World")).toBe("hello-world")
    })

    describe("with allowDots option", () => {
      it("should preserve dots when allowDots is true", () => {
        expect(convertToSlug("My File.txt", { allowDots: true })).toBe("my-file.txt")
        expect(convertToSlug("Archive.tar.gz", { allowDots: true })).toBe("archive.tar.gz")
      })

      it("should replace dots with separator when allowDots is false", () => {
        expect(convertToSlug("file.name", { allowDots: false })).toBe("file-name")
        expect(convertToSlug("www.example.com", { allowDots: false })).toBe("www-example-com")
      })

      it("should collapse mixed separators and dots", () => {
        // Preference for dot if allowed
        expect(convertToSlug("file.-name", { allowDots: true })).toBe("file.name")
        expect(convertToSlug("file-.name", { allowDots: true })).toBe("file.name")
        expect(convertToSlug("file..name", { allowDots: true })).toBe("file.name")
        
        // Regular collapse when not allowed
        expect(convertToSlug("file..name", { allowDots: false })).toBe("file-name")
      })

      it("should trim leading/trailing dots", () => {
        expect(convertToSlug(".file.", { allowDots: true })).toBe("file")
        expect(convertToSlug(" . file . ", { allowDots: true })).toBe("file")
      })
    })
  })

  describe("generateUniqueSlug", () => {
    it("should return base slug if not in existing list", () => {
      expect(generateUniqueSlug("hello-world", [])).toBe("hello-world")
      expect(generateUniqueSlug("hello-world", ["other-slug"])).toBe(
        "hello-world"
      )
    })

    it("should append number if slug exists", () => {
      expect(generateUniqueSlug("hello-world", ["hello-world"])).toBe(
        "hello-world-1"
      )
    })

    it("should increment until unique", () => {
      expect(
        generateUniqueSlug("hello-world", ["hello-world", "hello-world-1"])
      ).toBe("hello-world-2")
      expect(generateUniqueSlug("test", ["test", "test-1", "test-2"])).toBe(
        "test-3"
      )
    })

    it("should handle custom separator", () => {
      expect(
        generateUniqueSlug("hello-world", ["hello-world"], { separator: "_" })
      ).toBe("hello-world_1")
    })
  })

  describe("zodSlugValidation", () => {
    it("should return validation function", () => {
      const validate = zodSlugValidation()
      expect(typeof validate).toBe("function")
    })

    it("should validate correct slugs", () => {
      const validate = zodSlugValidation()
      expect(validate("hello-world")).toBe(true)
      expect(validate("test123")).toBe(true)
    })

    it("should reject invalid slugs", () => {
      const validate = zodSlugValidation()
      expect(validate("Hello World")).toBe(false)
      expect(validate("hello--world")).toBe(false)
    })

    it("should accept custom message", () => {
      const validate = zodSlugValidation("Custom error")
      expect(typeof validate).toBe("function")
    })
  })

  describe("zodSlugTransform", () => {
    it("should return transform function", () => {
      const transform = zodSlugTransform()
      expect(typeof transform).toBe("function")
    })

    it("should transform text to slug", () => {
      const transform = zodSlugTransform()
      expect(transform("Hello World")).toBe("hello-world")
      expect(transform("Test 123!!!")).toBe("test-123")
    })

    it("should handle custom separator", () => {
      const transform = zodSlugTransform({ separator: "_" })
      expect(transform("Hello World")).toBe("hello_world")
    })
  })

  describe("slugSchema", () => {
    it("should create schema with default message", () => {
      const schema = slugSchema.create()
      expect(schema._type).toBe("slug-validator")
      expect(typeof schema.validate).toBe("function")
      expect(schema.message).toContain("valid slug")
    })

    it("should create schema with custom message", () => {
      const schema = slugSchema.create("Custom validation message")
      expect(schema.message).toBe("Custom validation message")
    })

    it("should validate using created schema", () => {
      const schema = slugSchema.create()
      expect(schema.validate("hello-world")).toBe(true)
      expect(schema.validate("Hello World")).toBe(false)
    })
  })

  describe("autoSlugSchema", () => {
    it("should provide transform function", () => {
      const transform = autoSlugSchema.transform()
      expect(typeof transform).toBe("function")
    })

    it("should transform text to slug", () => {
      const transform = autoSlugSchema.transform()
      expect(transform("My Post Title")).toBe("my-post-title")
    })

    it("should handle custom separator", () => {
      const transform = autoSlugSchema.transform({ separator: "_" })
      expect(transform("My Post Title")).toBe("my_post_title")
    })
  })
})
