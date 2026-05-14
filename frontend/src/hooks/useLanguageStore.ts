import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import text from "../assets/text";

type Language = "en" | "no";

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;

  l: (entry: Record<Language, string>) => string,
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({

      language: "en",

      setLanguage: (lang) => set({ language: lang }),

      l: (entry) => entry[get().language],

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