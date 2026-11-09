import type { AppData } from "../types/models";
import { createSeedData } from "../data/seed";
export interface Repository {
  load(): AppData;
  save(data: AppData): void;
  reset(): AppData;
}
export const STORAGE_KEY = "cedarsign:v1";
export function createLocalRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): Repository {
  const save = (data: AppData) =>
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data }));
  return {
    load() {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw === null) {
        const data = createSeedData();
        save(data);
        return data;
      }
      try {
        const parsed = JSON.parse(raw);
        if (
          parsed.version !== 1 ||
          !parsed.data ||
          !["users", "sources", "templates", "documents"].every((k) =>
            Array.isArray(parsed.data[k]),
          )
        )
          throw new Error();
        return parsed.data as AppData;
      } catch {
        throw new Error(
          "Saved demo data is unreadable. Reset demo data to continue.",
        );
      }
    },
    save,
    reset() {
      const data = createSeedData();
      save(data);
      return data;
    },
  };
}
