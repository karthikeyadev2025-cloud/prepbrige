import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import hi from './locales/hi.json'
import bn from './locales/bn.json'
import te from './locales/te.json'
import mr from './locales/mr.json'
import ta from './locales/ta.json'
import ur from './locales/ur.json'
import gu from './locales/gu.json'
import kn from './locales/kn.json'
import ml from './locales/ml.json'
import or from './locales/or.json'
import pa from './locales/pa.json'
import as from './locales/as.json'
import mai from './locales/mai.json'
import sat from './locales/sat.json'
import ks from './locales/ks.json'
import sa from './locales/sa.json'
import doi from './locales/doi.json'
import sd from './locales/sd.json'
import kok from './locales/kok.json'
import brx from './locales/brx.json'
import mni from './locales/mni.json'

const resources = {
  en, hi, bn, te, mr, ta, ur, gu, kn, ml, or, pa, as, mai, sat, ks, sa, doi, sd, kok, brx, mni
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
