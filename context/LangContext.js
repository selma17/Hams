import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    AsyncStorage.getItem('lang').then(l => { if (l) setLang(l); });
  }, []);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const changeLang = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('lang', newLang);
  };

  return (
    <LangContext.Provider value={{ lang, t, isRTL, changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);