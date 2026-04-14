/* eslint-disable @typescript-eslint/no-explicit-any */
// Convert snake_case string to camelCase
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

export type ToCamelCaseResult<T extends string> = SnakeToCamel<T>;

export type ObjectKeysToCamelCaseResult<
  T,
  IgnoredPaths extends string = never,
  CurrentPath extends string = ""
> = T extends readonly any[]
  ? ObjectKeysToCamelCaseResult<T[number], IgnoredPaths, CurrentPath>[]
  : T extends Date | RegExp | Function
    ? T
    : T extends object
      ? {
          [K in keyof T as SnakeToCamel<Extract<K, string>>]:
            `${CurrentPath}${CurrentPath extends "" ? "" : "."}${Extract<K, string>}` extends IgnoredPaths
              ? T[K] 
              : ObjectKeysToCamelCaseResult<
                  T[K],
                  IgnoredPaths,
                  `${CurrentPath}${CurrentPath extends "" ? "" : "."}${Extract<K, string>}`
                >;
        }
      : T;

/**
 * Converts a snake_case string to camelCase
 */
export const toCamelCase = <T extends string>(str: T): ToCamelCaseResult<T> => {
  return str.replace(/_([a-z])/g, (_, char) =>
    char.toUpperCase(),
  ) as ToCamelCaseResult<T>;
};


type Options<Paths extends string = string> = {
  ignoredPaths?: readonly Paths[];
};

/**
 * Converts all keys in an object from snake_case to camelCase recursively
 */
export function objectKeysToCamelCase<
  T extends Record<string, any>,
  IgnoredPaths extends string = never
>(
  obj: T,
  options?: Options<IgnoredPaths>,
  currentPath: string = ""
): ObjectKeysToCamelCaseResult<T, IgnoredPaths> {
  if (obj === null || typeof obj !== "object") return obj as any;

  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    typeof obj === "function"
  ) {
    return obj as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      objectKeysToCamelCase(
        item,
        options,
        `${currentPath}[${index}]`
      )
    ) as any;
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);

    const nextPath = currentPath
      ? `${currentPath}.${key}`
      : key;

    if (
      options?.ignoredPaths?.some(path =>
        nextPath === path || nextPath.startsWith(path + ".")
      )
    ) {
      acc[camelKey] = obj[key];
      return acc;
    }

    acc[camelKey] = objectKeysToCamelCase(
      obj[key],
      options,
      nextPath
    );

    return acc;
  }, {} as any);
}