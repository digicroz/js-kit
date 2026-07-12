export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type AllowedKeys<T> = keyof T;

type ExactUnionArray<Union, Arr extends readonly Union[]> =
  Exclude<Union, Arr[number]> extends never
    ? Exclude<Arr[number], Union> extends never
      ? Arr
      : never
    : never;

export function defineAllValues<Union>() {
  return <Arr extends readonly Union[]>(values: ExactUnionArray<Union, Arr>) =>
    values;
}
