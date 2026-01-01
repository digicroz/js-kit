/**
 * Validates a name string based on configured allowed special characters.
 * By default, allows alphanumeric characters and spaces.
 * 
 * Rules:
 * - Must start and end with an alphanumeric character.
 * - Can contain alphanumeric characters and allowed special characters.
 * - No consecutive special characters (e.g., double spaces).
 * 
 * @param name - The string to validate
 * @param options - Configuration options
 * @param options.allowedSpecialChars - Array of allowed special characters (default: [' '])
 * @returns True if valid, false otherwise
 */
export function isValidName(
  name: string,
  options: { allowedSpecialChars?: string[] } = {}
): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const { allowedSpecialChars = [' '] } = options;

  // Escape special chars for regex
  const escapedChars = allowedSpecialChars
    .map((char) => char.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
    .join('');

  // Regex construction:
  // ^[a-zA-Z0-9]+ : Starts with alphanumeric
  // (?: ... )* : Zero or more groups of:
  //   [escapedChars] : One allowed special char
  //   [a-zA-Z0-9]+ : Followed by one or more alphanumeric
  // $ : End of string
  // This ensures:
  // 1. Starts/Ends with alphanumeric
  // 2. Separators are always followed by alphanumeric (so no trailing, no consecutive)
  
  const pattern = new RegExp(
    `^[a-zA-Z0-9]+(?:[${escapedChars}][a-zA-Z0-9]+)*$`
  );

  return pattern.test(name);
}

/**
 * Normalizes a string into a valid name.
 * - Trims whitespace
 * - Removes invalid characters
 * - Collapses consecutive special characters
 * - Trims leading/trailing special characters
 * 
 * @param text - The text to normalize
 * @param options - Configuration options
 * @param options.allowedSpecialChars - Array of allowed special characters (default: [' '])
 * @returns Normalized name string
 */
export function normalizeName(
  text: string,
  options: { allowedSpecialChars?: string[] } = {}
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const { allowedSpecialChars = [' '] } = options;
  const escapedChars = allowedSpecialChars
    .map((char) => char.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
    .join('');

  // 1. Trim
  let normalized = text.trim();

  // 2. Replace all whitespace with the first allowed special char (if ' ' is allowed, use ' ', else usage defined?)
  // Actually, usually we just want to remove invalid chars.
  // Unless we want to treat existing whitespace as the primary separator if ' ' is allowed.
  // If ' ' is allowed, we keep it.
  
  // Strategy:
  // Remove anything that is NOT alphanumeric OR allowed special char.
  normalized = normalized.replace(
    new RegExp(`[^a-zA-Z0-9${escapedChars}]`, 'g'),
    ''
  );

  // Collapse consecutive special chars
  // We want to collapse any sequence of [escapedChars] into a single instance of... which one?
  // Let's assume we preserve the first one found, or just collapse identicals?
  // User Requirement: "no consicutive two special chars, even if . and -"
  // So `A . - B` is invalid. Should become `A . B` or `A - B`.
  // Let's collapse any sequence of allowed special chars into the *first* char of that sequence.
  normalized = normalized.replace(
    new RegExp(`[${escapedChars}]{2,}`, 'g'),
    (match) => match[0]
  );

  // Trim leading/trailing special chars
  normalized = normalized.replace(
    new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g'),
    ''
  );

  return normalized;
}

/**
 * Zod validation helper for names
 */
export function zodNameValidation(
  optionsOrMessage?: string | { message?: string; allowedSpecialChars?: string[] }
) {
  const options =
    typeof optionsOrMessage === 'string'
      ? { message: optionsOrMessage }
      : optionsOrMessage || {};

  return (val: string) =>
    isValidName(val, { allowedSpecialChars: options.allowedSpecialChars });
}

/**
 * Zod transform helper for name normalization
 */
export function zodNameTransform(options?: { allowedSpecialChars?: string[] }) {
  return (val: string) => normalizeName(val, options);
}

/**
 * Pre-configured Zod schema for names
 */
export const nameSchema = {
  create: (
    customMessageOrOptions?:
      | string
      | { message?: string; allowedSpecialChars?: string[] }
  ) => {
    const options =
      typeof customMessageOrOptions === 'string'
        ? { message: customMessageOrOptions }
        : customMessageOrOptions || {};

    const message =
      options.message ||
      'Invalid name format. Must be alphanumeric, no leading/trailing/consecutive special characters.';

    return {
      _type: 'name-validator' as const,
      validate: zodNameValidation(options),
      message,
    };
  },
};
