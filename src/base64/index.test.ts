import { describe, it, expect } from 'vitest';
import { encodeToBase64, decodeFromBase64 } from './index';

describe('base64', () => {
    describe('encodeToBase64', () => {
        it('should encode a simple object to base64', () => {
            const obj = { hello: "world" };
            const encoded = encodeToBase64(obj);
            expect(typeof encoded).toBe('string');
            expect(encoded).not.toBe(JSON.stringify(obj));
        });

        it('should encode a number', () => {
             const num = 123;
             const encoded = encodeToBase64(num);
             expect(typeof encoded).toBe('string');
        });

        it('should throw error for null', () => {
            expect(() => encodeToBase64(null)).toThrow("Cannot encode null or undefined");
        });

        it('should throw error for undefined', () => {
            expect(() => encodeToBase64(undefined)).toThrow("Cannot encode null or undefined");
        });
    });

    describe('decodeFromBase64', () => {
        it('should decode a valid base64 string back to object', () => {
            const originalObj = { foo: "bar", baz: 123 };
            const encoded = encodeToBase64(originalObj);
            const decoded = decodeFromBase64(encoded);
            expect(decoded).toEqual(originalObj);
        });
        
        it('should decode to generic type', () => {
            interface MyType { foo: string; }
            const originalObj: MyType = { foo: "bar" };
            const encoded = encodeToBase64(originalObj);
            const decoded = decodeFromBase64<MyType>(encoded);
            expect(decoded.foo).toBe("bar");
        });


        it('should throw error for empty string', () => {
            expect(() => decodeFromBase64("")).toThrow("Invalid base64 input");
        });

        // @ts-ignore
        it('should throw error for non-string input', () => {
             // @ts-ignore
            expect(() => decodeFromBase64(123)).toThrow("Invalid base64 input");
        });

        it('should throw error for invalid base64 string', () => {
             // Not a valid json base64
             const invalidBase64 = Buffer.from("invalid json", "utf8").toString("base64");
             // JSON.parse will fail
             expect(() => decodeFromBase64(invalidBase64)).toThrow("Failed to decode base64 string");
        });
    });
});
