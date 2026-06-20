import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import text from "../assets/text";

export type Language = "en" | "fr";

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;

  l: (entry: Record<Language, string> | undefined) => string | undefined,
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({

      language: "en",

      setLanguage: (lang) => set({ language: lang }),

      l: (entry) => entry ? entry[get().language] : undefined,

    }),
    {
      name: "language-store",
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);

export default useLanguageStore;
export {text as t};