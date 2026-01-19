export type StdSuccess<T> = {
  status: "success";
  result: T;
};

export type StdError<E extends string | number = string> = {
  status: "error";
  error: {
    code: E;
    message?: string;

  };
};

export type StdResponse<T, E extends string | number = string> =
  | StdSuccess<T>
  | StdError<E>;
