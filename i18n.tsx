import i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import translationEn from "./assets/en/translate.json";
import translationFr from "./assets/fr/translate.json";

const defaultLng = 'en';
let lng = defaultLng;

const allowedLanguages = ['en', 'fr'];

const url = window.location.pathname;
let langKey = url.split('/')[1];

if (allowedLanguages.indexOf(langKey) !== -1) {
    lng = langKey.toLowerCase();
}
else // try again
{
    langKey = url.split('/')[2];
    if (allowedLanguages.indexOf(langKey) !== -1) {
        lng = langKey.toLowerCase();
    }
}

const resources = {
    en: {
        home: translationEn,
        main: translationEn,
    },
    fr: {
        home: translationFr,
    },
}

i18next
    .use(initReactI18next)
    .init({
        resources,
        lng: lng, //default language
        fallbackLng: ["en", "fr"]
    });

export default i18next;