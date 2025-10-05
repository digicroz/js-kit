
export * from './capitalize';
export * from './truncate';

export function randomStringWithFixedLength(length: number): string {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Length must be a positive integer.");
    }

    return Array.from({ length }, () => Math.random().toString(36)[2]).join("");
}