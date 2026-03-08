# Standard Response Utilities

Standardized API response types and utilities for consistent API communication in JavaScript/TypeScript applications.

## Features

- ✅ **Type Safety** - Generic types for flexible yet strict response structures
- ✅ **Standard Format** - Consistent success and error response shapes
- ✅ **Helper Functions** - Easy-to-use factory methods for creating responses
- ✅ **Zero Dependencies** - Pure TypeScript implementation

## Installation

```bash
npm install @digicroz/js-kit
```

## Usage

### Importing

```typescript
import {
  stdResponse,
  StdSuccess,
  StdError,
  StdResponse,
} from "@digicroz/js-kit/std-response";

// Or from the main package
import { stdResponse } from "@digicroz/js-kit";
```

### Creating Responses

#### Success Response

Use `stdResponse.success` to create a standard success response.

```typescript
const response = stdResponse.success({ id: 1, name: "User" });
/*
{
  status: "success",
  result: { id: 1, name: "User" }
}
*/
```

#### Error Response

Use `stdResponse.error` to create a standard error response.

```typescript
const error = stdResponse.error("internal_error");
/*
{
  status: "error",
  error: {
    code: "internal_error"
  }
}
*/

const error = stdResponse.error("validation_error", "Invalid input");
/*
{
  status: "error",
  error: {
    code: "validation_error",
    message: "Invalid input"
  }
}
*/

const error = stdResponse.error("validation_error", "Invalid input", {
  field: "email",
  reason: "invalid format",
});
/*
{
  status: "error",
  error: {
    code: "validation_error",
    message: "Invalid input",
    details: { field: "email", reason: "invalid format" }
  }
}
*/
```

#### Narrowing Error Details by Code

Each error code can have its own details type for full narrowing support.

```typescript
type ApiError =
  | StdError<"validation_error", { field: string; reason: string }>
  | StdError<"not_found", { resource: string }>
  | StdError<"internal_error">;

type ApiResponse = StdSuccess<{ id: number }> | ApiError;

function handle(res: ApiResponse) {
  if (res.status === "error") {
    switch (res.error.code) {
      case "validation_error":
        res.error.details; // { field: string; reason: string }
        break;
      case "not_found":
        res.error.details; // { resource: string }
        break;
      case "internal_error":
        res.error.details; // undefined
        break;
    }
  }
}
```

## Type Definitions

### `StdSuccess<T>`

Represents a successful operation.

```typescript
type StdSuccess<T> = {
  status: "success";
  result: T;
};
```

### `StdError<E, D>`

Represents a failed operation.

```typescript
type StdError<E extends string | number = string, D = undefined> = {
  status: "error";
  error: {
    code: E;
    message?: string;
    details?: D;
  };
};
```

### `StdResponse<T, E, D>`

Union type of `StdSuccess` and `StdError`.

```typescript
type StdResponse<T, E extends string | number = string, D = undefined> =
  | StdSuccess<T>
  | StdError<E, D>;
```
