/* eslint-disable @typescript-eslint/no-explicit-any */
// Convert snake_case string to camelCase
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamel<U>>}`
    : S;

// Convert object keys recursively
export type SnakeToCamelKeys<T> = {
    [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K] extends object
        ? SnakeToCamelKeys<T[K]>
        : T[K];
};

const snakeToCamel = (str: string) => str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

export function convertKeysToCamelCase<T extends Record<string, any>>(obj: T): SnakeToCamelKeys<T> {
    if (obj === null || typeof obj !== "object") return obj as any;

    if (Array.isArray(obj)) {
        return obj.map(convertKeysToCamelCase) as any;
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = snakeToCamel(key);
        acc[camelKey] = convertKeysToCamelCase(obj[key]);
        return acc;
    }, {} as any);
}
