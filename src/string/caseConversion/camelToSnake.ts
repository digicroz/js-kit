/* eslint-disable @typescript-eslint/no-explicit-any */
// camelCase → snake_case (string)
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
    ? U extends Uncapitalize<U>
        ? `${Lowercase<T>}${CamelToSnake<U>}`
        : `${Lowercase<T>}_${CamelToSnake<U>}`
    : S;

export type CamelUnionToSnake<T extends string> = CamelToSnake<T>;
// object keys
export type CamelToSnakeKeys<T> = {
    [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K] extends readonly any[]
        ? CamelToSnakeKeys<T[K][number]>[]
        : T[K] extends object
          ? CamelToSnakeKeys<T[K]>
          : T[K];
};

export const camelToSnake = <T extends string>(value: T): CamelUnionToSnake<T> => {
    return value.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`) as CamelUnionToSnake<T>;
};

export function convertKeysToSnakeCase<T extends Record<string, any>>(obj: T): CamelToSnakeKeys<T> {
    if (obj === null || typeof obj !== "object") return obj as any;

    if (Array.isArray(obj)) {
        return obj.map(convertKeysToSnakeCase) as any;
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = camelToSnake(key);
        acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
        return acc;
    }, {} as any);
}
