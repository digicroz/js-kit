
import { describe, it, expect } from 'vitest';
import { getArrayBuffer, hashContent, sanitizeFilename, getHashedFilename } from './index';

describe('file utils', () => {
    describe('getArrayBuffer', () => {
        it('should return ArrayBuffer from Uint8Array', async () => {
            const arr = new Uint8Array([1, 2, 3]);
            const buf = await getArrayBuffer(arr);
            expect(buf).toBeInstanceOf(ArrayBuffer);
            expect(new Uint8Array(buf)).toEqual(arr);
        });

        it('should return ArrayBuffer from Buffer (Node)', async () => {
             const bufNode = Buffer.from([1, 2, 3]);
             const buf = await getArrayBuffer(bufNode);
             expect(buf).toBeInstanceOf(ArrayBuffer);
             // Buffer.buffer is the underlying ArrayBuffer
             expect(new Uint8Array(buf)).toEqual(new Uint8Array(bufNode));
        });

         it('should throw error for unsupported type', async () => {
             await expect(getArrayBuffer({})).rejects.toThrow("Unsupported input type for hashing");
        });
    });

    describe('hashContent', () => {
        it('should hash a simple string (converted to buffer)', async () => {
            const input = Buffer.from("hello world");
            // SHA-256 of "hello world" is:
            // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
            const hash = await hashContent(input);
            expect(hash).toBe("b94d27b9"); // default length 8
        });

        it('should respect hash length', async () => {
            const input = Buffer.from("test");
            const hash = await hashContent(input, 12);
            expect(hash.length).toBe(12);
        });
    });

    describe('sanitizeFilename', () => {
        it('should lowercase and trim', () => {
            expect(sanitizeFilename("  TeSt  ")).toBe("test");
        });

        it('should replace spaces with dashes', () => {
            expect(sanitizeFilename("hello world")).toBe("hello-world");
        });

        it('should remove special characters', () => {
            expect(sanitizeFilename("hello@#$world!")).toBe("helloworld");
        });
        
        it('should handle mixed complex case', () => {
             expect(sanitizeFilename("  My Cool File #1.txt  ")).toBe("my-cool-file-1.txt");
        });
    });

    describe('getHashedFilename', () => {
        it('should append hash to filename with extension', async () => {
            const input = Buffer.from("content");
            const name = "myImage.png";
            const hashed = await getHashedFilename(input, name);
            // hash of "content" first 8 chars
            expect(hashed).toMatch(/^myimage\.[a-f0-9]{8}\.png$/);
        });

        it('should append hash to filename without extension', async () => {
             const input = Buffer.from("content");
             const name = "README";
             const hashed = await getHashedFilename(input, name);
             expect(hashed).toMatch(/^readme\.[a-f0-9]{8}$/);
        });

        it('should use custom hash length', async () => {
             const input = Buffer.from("content");
             const name = "file.txt";
             const hashed = await getHashedFilename(input, name, { hashLength: 4 });
             expect(hashed).toMatch(/^file\.[a-f0-9]{4}\.txt$/);
        });
    });
});
