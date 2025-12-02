export function cleanedData<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => !!v),
  ) as Partial<T>;
}
