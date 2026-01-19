
export function encodeToBase64(obj: unknown): string {
    if (obj === null || obj === undefined) {
        throw new Error("Cannot encode null or undefined");
    }

    const json = JSON.stringify(obj);
    return Buffer.from(json, "utf8").toString("base64");
}

export function decodeFromBase64<T = unknown>(base64: string): T {
    if (!base64 || typeof base64 !== "string") {
        throw new Error("Invalid base64 input");
    }

    try {
        const json = Buffer.from(base64, "base64").toString("utf8");
        return JSON.parse(json);
    } catch (error) {
        throw new Error("Failed to decode base64 string");
    }
}
