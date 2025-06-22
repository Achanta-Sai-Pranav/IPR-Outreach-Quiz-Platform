import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationGU from "./locales/gu/translation.json";
import translationHI from "./locales/hi/translation.json";

import homeEN from "./locales/en/home.json";
import homeGU from "./locales/gu/home.json";
import homeHI from "./locales/hi/home.json";

import navEN from "./locales/en/nav.json";
import navGU from "./locales/gu/nav.json";
import navHI from "./locales/hi/nav.json";

import authEN from "./locales/en/auth.json";
import authGU from "./locales/gu/auth.json";
import authHI from "./locales/hi/auth.json";

import quizEN from "./locales/en/quiz.json";
import quizGU from "./locales/gu/quiz.json";
import quizHI from "./locales/hi/quiz.json";

import dashboardEN from "./locales/en/dashboard.json";
import dashboardGU from "./locales/gu/dashboard.json";
import dashboardHI from "./locales/hi/dashboard.json";

import resultsQuizEN from "./locales/en/quiz.json";
import resultsQuizGU from "./locales/gu/quiz.json";
import resultsQuizHI from "./locales/hi/quiz.json";

import sidebarEN from "./locales/en/sidebar.json";
import sidebarGU from "./locales/gu/sidebar.json";
import sidebarHI from "./locales/hi/sidebar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    default: "en",
    fallbackLng: "en",
    returnObjects: true,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: translationEN,
        home: homeEN,
        nav: navEN,
        auth: authEN,
        quiz: quizEN,
        dashboard: dashboardEN,
        resultsQuiz: resultsQuizEN,
        sidebar: sidebarEN,
      },
      gu: {
        translation: translationGU,
        home: homeGU,
        nav: navGU,
        auth: authGU,
        quiz: quizGU,
        dashboard: dashboardGU,
        resultsQuiz: resultsQuizGU,
        sidebar: sidebarGU,
      },
      hi: {
        translation: translationHI,
        home: homeHI,
        nav: navHI,
        auth: authHI,
        quiz: quizHI,
        dashboard: dashboardHI,
        resultsQuiz: resultsQuizHI,
        sidebar: sidebarHI,
      },
    },
  });

export default i18n;
