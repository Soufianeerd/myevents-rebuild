export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T, E = never>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

export const err = <E, T = never>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

export const isOk = <T, E>(
  result: Result<T, E>,
): result is { ok: true; value: T } => {
  return result.ok === true;
};

export const isErr = <T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } => {
  return result.ok === false;
};
