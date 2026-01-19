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
  StdResponse 
} from "@digicroz/js-kit/std-response"

// Or from the main package
import { stdResponse } from "@digicroz/js-kit"
```

### creating Responses

#### Success Response

Use `stdResponse.success` to create a standard success response.

```typescript
// Simple success response
const response = stdResponse.success({ id: 1, name: "User" });
/*
{
  status: "success",
  result: { id: 1, name: "User" }
}
*/

// Success response with message
const response = stdResponse.success({ id: 1 }, "User created successfully");
/*
{
  status: "success",
  message: "User created successfully",
  result: { id: 1 }
}
*/
```

#### Error Response

Use `stdResponse.error` to create a standard error response.

```typescript
// Simple error response
const error = stdResponse.error("INTERNAL_ERROR");
/*
{
  status: "error",
  error: {
    code: "INTERNAL_ERROR"
  }
}
*/

// Error response with message
const error = stdResponse.error("VALIDATION_ERROR", "Invalid input");
/*
{
  status: "error",
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input"
  }
}
*/

// Error response with additional details
const error = stdResponse.error(
  "VALIDATION_ERROR", 
  "Invalid input", 
  { field: "email", reason: "invalid format" }
);
/*
{
  status: "error",
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input"
  },
  details: { field: "email", reason: "invalid format" }
}
*/
```

## Type Definitions

### `StdSuccess<T>`

Represents a successful operation.

```typescript
type StdSuccess<T> = {
  status: "success";
  message?: string;
  result: T;
}
```

### `StdError<E>`

Represents a failed operation.

```typescript
type StdError<E extends string | number = string> = {
  status: "error";
  error: {
    code: E;
    message?: string;
  };
  details?: unknown;
}
```

### `StdResponse<T, E>`

Union type of `StdSuccess` and `StdError`.

```typescript
type StdResponse<T, E extends string | number = string> = 
  | StdSuccess<T> 
  | StdError<E>;
```
