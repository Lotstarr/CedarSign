import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppData, SigningDocument } from "../types/models";
import { createLocalRepository } from "../repositories/localRepository";
const repository = createLocalRepository(localStorage);
interface AppContextValue {
  data: AppData;
  userId: string;
  setUserId: (id: string) => void;
  commit: (next: AppData) => void;
  updateDocument: (doc: SigningDocument) => void;
  reset: () => void;
}
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => repository.load());
  const [userId, setUserId] = useState("jordan");
  // Persist first: a storage failure must not leave UI state claiming a successful signing event.
  const commit = (next: AppData) => {
    repository.save(next);
    setData(next);
  };
  const updateDocument = (doc: SigningDocument) =>
    commit({
      ...data,
      documents: data.documents.map((d) => (d.id === doc.id ? doc : d)),
    });
  const reset = () => {
    setData(repository.reset());
    setUserId("jordan");
  };
  return (
    <AppContext.Provider
      value={{ data, userId, setUserId, commit, updateDocument, reset }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider required");
  return context;
}
