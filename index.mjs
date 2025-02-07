import 'dotenv/config';
import * as deepl from 'deepl-node';
import { createTranslationInPhrase, fetchKeys, fetchLocales, fetchTranslationsForKey } from './phrase.mjs';

const mainTranslationCode = process.env.MAIN_TRANSLATION_CODE ?? 'en';
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

const getMissingTranslations = (translations) => 
  ['fr', 'nl', 'es'].filter(
    (lang) => !translations.some(translation => translation?.locale?.code === lang)
  );

const translateKey = async (content, targetLang) => {
  return await translator.translateText(content, mainTranslationCode, targetLang);
};

const locales = await fetchLocales();
(await fetchKeys()).forEach(async (key) => {
  const keyId = key?.id;
  if (!keyId || keyId === null) {
    console.log("Skipping one key because is undefined or null");
    return;
  }

  const translations = await fetchTranslationsForKey(keyId);
  const missingTranslationsForKey = getMissingTranslations(translations);

  missingTranslationsForKey.forEach(async (lang) => {
    const mainTranslation = translations.find(translation => translation?.locale?.code === mainTranslationCode);
    const translation = await translateKey(mainTranslation.content, lang);

    console.log(`Sending ${translation?.text} for key ${keyId} for ${lang}`);
    createTranslationInPhrase(keyId, translation?.text, locales.find(locale => locale.code === lang).id);
  });
})
