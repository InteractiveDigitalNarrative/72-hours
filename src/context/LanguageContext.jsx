import { createContext, useContext, useState } from 'react';

const LanguageCtx = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(null);

  return (
    <LanguageCtx.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageCtx.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageCtx) ?? { language: 'en', setLanguage: () => {} };
}
