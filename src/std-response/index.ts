export type StdSuccess<T> = {
  status: "success";
  result: T;
};

export type StdError<E extends string | number = string, D = undefined> = {
  status: "error";
  error: {
    code: E;
    message?: string;
    details?: D;
  };
};

export type StdResponse<T, E extends string | number = string, D = undefined> =
  | StdSuccess<T>
  | StdError<E, D>;

export const stdResponse = Object.freeze({
  success: <T>(result: T): StdSuccess<T> => ({
    status: "success",
    result,
  }),

  error: <E extends string | number, D = undefined>(
    code: E,
    message?: string,
    details?: D,
  ): StdError<E, D> => ({
    status: "error",
    error: { code, message, details },
  }),
});

// helper types 

export type StdExtractSuccess<T> = Extract<T, { status: "success" }>;
export type StdExtractError<T> = Extract<T, { status: "error" }>;
export type StdExtractResult<T> =
  Extract<T, { status: "success" }> extends { result: infer D }
    ? D
    : never;

export type StdExtractErrorCode<T> =
  Extract<T, { status: "error" }> extends {
    error: { code: infer C };
  }
    ? C
    : never;

