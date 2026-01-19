export type StdSuccess<T> = {
  status: "success";
  result: T;
};

export type StdError<E extends string | number> = {
  status: "error";
  error: {
    code: E;
    message?: string;
  };
};

export type StdResponse<T, E extends string | number> =
  | StdSuccess<T>
  | StdError<E>;

export const stdResponse = Object.freeze({
  success: <T>(result: T): StdSuccess<T> => ({
    status: "success",
    result,
  }),

  error: <E extends string | number>(
    code: E,
    message?: string
  ): StdError<E> => ({
    status: "error",
    error: { code, message },
  }),
});
