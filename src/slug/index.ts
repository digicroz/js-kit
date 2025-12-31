/**
 * Checks if a string is a valid slug
 * A valid slug contains only lowercase alphanumeric characters and hyphens,
 * with no consecutive hyphens and no leading/trailing hyphens
 * 
 * @param slug - The string to validate
 * @returns True if the string is a valid slug, false otherwise
 * 
 * @example
 * ```ts
 * isValidSlug('hello-world') // true
 * isValidSlug('hello--world') // false (consecutive hyphens)
 * isValidSlug('Hello-World') // false (uppercase)
 * isValidSlug('-hello-world') // false (leading hyphen)
 * isValidSlug('hello_world') // false (underscore not allowed)
 * ```
 */
export function isValidSlug(
  slug: string,
  options: { allowDots?: boolean } = {}
): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  const { allowDots = false } = options;

  // Check if slug matches the pattern:
  // - starts with alphanumeric
  // - ends with alphanumeric
  // - contains only lowercase alphanumeric and single hyphens (and dots if allowed)
  // - no consecutive separators (hyphens or dots)
  
  if (allowDots) {
    // pattern allowing dots:
    // starts with alphanumeric
    // middle: alphanumeric or single hyphen/dot followed by alphanumeric
    // ends with alphanumeric
    const slugWithDotsPattern = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
    return slugWithDotsPattern.test(slug);
  }

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  
  return slugPattern.test(slug);
}

/**
 * Converts a string to a URL-safe slug
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces and underscores with hyphens
 * - Removes consecutive hyphens
 * - Trims leading and trailing hyphens
 * 
 * @param text - The string to convert to a slug
 * @param options - Optional configuration
 * @param options.separator - Character to use as separator (default: '-')
 * @returns A URL-safe slug
 * 
 * @example
 * ```ts
 * convertToSlug('Hello World') // 'hello-world'
 * convertToSlug('Hello  World!!!') // 'hello-world'
 * convertToSlug('Hello_World') // 'hello-world'
 * convertToSlug('  Hello World  ') // 'hello-world'
 * convertToSlug('Hello---World') // 'hello-world'
 * convertToSlug('Café & Restaurant') // 'cafe-restaurant'
 * convertToSlug('Product #123') // 'product-123'
 * ```
 */
export function convertToSlug(
  text: string,
  options: { separator?: string; allowDots?: boolean } = {}
): string {
  const { separator = '-', allowDots = false } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape separator for use in regex char class
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents and diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!allowDots) {
    // Replace dots with separator
    slug = slug.replace(/\./g, separator);
  }

  slug = slug
    // Replace spaces, underscores with separator
    .replace(/[\s_]+/g, separator)
    // Remove all non-alphanumeric characters except the separator (and dot if allowed)
    .replace(new RegExp(`[^a-z0-9${escapedSeparator}${allowDots ? '\\.' : ''}]`, 'g'), '');

  if (allowDots) {
    // Collapse consecutive separators/dots
    // If sequence contains a dot, we generally want to keep it as a dot (e.g. file.-extension -> file.extension)
    slug = slug.replace(new RegExp(`[${escapedSeparator}.]+`, 'g'), (match) => {
      return match.includes('.') ? '.' : separator;
    });
  } else {
    // Replace multiple consecutive separators with single separator
    slug = slug.replace(new RegExp(`${escapedSeparator}+`, 'g'), separator);
  }
  
  // Remove leading and trailing separators (and dots)
  const trimRegex = new RegExp(`^[${escapedSeparator}${allowDots ? '\\.' : ''}]+|[${escapedSeparator}${allowDots ? '\\.' : ''}]+$`, 'g');
  return slug.replace(trimRegex, '');
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @param options - Optional configuration
 * @param options.separator - Character to use before the number (default: '-')
 * @returns A unique slug
 * 
 * @example
 * ```ts
 * generateUniqueSlug('hello-world', ['hello-world']) // 'hello-world-1'
 * generateUniqueSlug('hello-world', ['hello-world', 'hello-world-1']) // 'hello-world-2'
 * generateUniqueSlug('hello-world', []) // 'hello-world'
 * ```
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
  options: { separator?: string } = {}
): string {
  const { separator = '-' } = options;

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}${separator}${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}${separator}${counter}`;
  }

  return uniqueSlug;
}

/**
 * Creates a Zod refinement function for slug validation
 * Use with z.string().refine() or z.string().superRefine()
 * 
 * @param optionsOrMessage - Custom error message or options object
 * @returns Refinement function for Zod
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { zodSlugValidation } from '@digicroz/js-kit';
 * 
 * // Basic usage
 * const schema = z.object({
 *   slug: z.string().refine(zodSlugValidation(), {
 *     message: 'Invalid slug format'
 *   })
 * });
 * 
 * // Allow dots (e.g. for filenames)
 * const fileSchema = z.object({
 *   filename: z.string().refine(zodSlugValidation({ allowDots: true }), {
 *     message: 'Invalid filename format'
 *   })
 * });
 * ```
 */
export function zodSlugValidation(
  optionsOrMessage?: string | { message?: string; allowDots?: boolean }
) {
  const options =
    typeof optionsOrMessage === 'string'
      ? { message: optionsOrMessage }
      : optionsOrMessage || {};
      
  return (val: string) => isValidSlug(val, { allowDots: options.allowDots });
}

/**
 * Creates a Zod transform function that converts strings to slugs
 * Use with z.string().transform()
 * 
 * @param options - Optional configuration
 * @param options.separator - Character to use as separator (default: '-')
 * @param options.allowDots - Whether to allow dots in the slug (default: false)
 * @returns Transform function for Zod
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { zodSlugTransform } from '@digicroz/js-kit';
 * 
 * const schema = z.object({
 *   title: z.string(),
 *   slug: z.string().transform(zodSlugTransform())
 * });
 * 
 * schema.parse({ title: 'Hello', slug: 'Hello World!!!' })
 * // { title: 'Hello', slug: 'hello-world' }
 * ```
 */
export function zodSlugTransform(options?: { separator?: string; allowDots?: boolean }) {
  return (val: string) => convertToSlug(val, options);
}

/**
 * Pre-configured Zod schema for slug validation
 * Validates that the string is a valid slug format
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { slugSchema } from '@digicroz/js-kit';
 * 
 * const postSchema = z.object({
 *   slug: slugSchema
 * });
 * 
 * postSchema.parse({ slug: 'hello-world' }); // ✓ Valid
 * postSchema.parse({ slug: 'Hello World' }); // ✗ Invalid
 * ```
 */
export const slugSchema = {
  /**
   * Get a Zod string schema that validates slug format
   * Requires zod to be installed: npm install zod
   */
  create: (
    customMessageOrOptions?: string | { message?: string; allowDots?: boolean }
  ) => {
    // Dynamic import to avoid making zod a required dependency
    const options =
      typeof customMessageOrOptions === 'string'
        ? { message: customMessageOrOptions }
        : customMessageOrOptions || {};
        
    const message =
      options.message ||
      'Must be a valid slug (lowercase, alphanumeric, and hyphens only, no consecutive hyphens)';

    return {
      _type: 'slug-validator' as const,
      validate: zodSlugValidation(options),
      message
    };
  }
};

/**
 * Pre-configured Zod schema that auto-converts strings to slugs
 * Automatically transforms any string input into a valid slug
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { autoSlugSchema } from '@digicroz/js-kit';
 * 
 * const postSchema = z.object({
 *   title: z.string(),
 *   slug: z.string().transform(autoSlugSchema.transform())
 * });
 * 
 * postSchema.parse({ title: 'My Post', slug: 'Hello World!!!' })
 * // { title: 'My Post', slug: 'hello-world' }
 * ```
 */
export const autoSlugSchema = {
  /**
   * Get a transform function for Zod
   */
  transform: (options?: { separator?: string }) => zodSlugTransform(options)
};
