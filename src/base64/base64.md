# Base64

Utilities for encoding to and decoding from Base64 strings, specifically handling object serialization via JSON.

## Import

```typescript
import { encodeToBase64, decodeFromBase64 } from '@digicroz/js-kit';
```

## Functions

### `encodeToBase64(obj: unknown): string`

Encodes an object (or primitive) into a Base64 string. Internally it uses `JSON.stringify` before encoding.

**Parameters:**

- `obj`: The input to encode. Cannot be `null` or `undefined`.

**Returns:**

- A Base64 string.

**Throws:**
- Error if input is `null` or `undefined`.

**Example:**

```typescript
const token = encodeToBase64({ userId: 123, role: 'admin' });
console.log(token); // eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIn0=
```

### `decodeFromBase64<T>(base64: string): T`

Decodes a Base64 string back into its original type. Handles `JSON.parse` internally.

**Parameters:**

- `base64`: The Base64 string to decode.

**Returns:**

- The decoded object of type `T`.

**Throws:**
- Error if input is empty or not a string.
- Error if decoding or parsing fails.

**Example:**

```typescript
const data = decodeFromBase64<{ userId: number }>(token);
console.log(data.userId); // 123
```
