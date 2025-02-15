import 'dotenv/config';
import * as deepl from 'deepl-node';
import { fetchKeys, fetchLocales, fetchTranslationsForKey } from './phrase.mjs';

const transformLang = (lang) =>  lang.indexOf('-') >= 0 ? lang.slice(0, lang.indexOf('-')) : lang;

const mainTranslationCode = process.env.MAIN_TRANSLATION_CODE ?? 'en';
const sourceLang = transformLang(mainTranslationCode);
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
const dryRun = process.env?.DRY_RUN?.toLowerCase() == "true";
const waitTime = process.env.WAIT_TIME_IN_MS ?? 200;
const verbose = process.env.VERBOSE ?? false;

const wait = () => new Promise(res => setTimeout(res, waitTime));

export const printAction = (actionText) => {
  if (verbose) {
    console.log(actionText);
  }
}


const getMissingTranslations = (langs, translations) => 
  langs.filter(
    (lang) => !translations.some(translation => translation?.locale?.code === lang)
  );

const translateKey = async (content, targetLang) => {
  const tranformedTargetLang = transformLang(targetLang);
  printAction(`Translating ${content} to ${tranformedTargetLang}`);
  try {
    return await translator.translateText(content, sourceLang, targetLang);
  } catch (ignored) {
    return;
  }
};

const start = async (keys) => {
  for (const key of keys) {
    const keyId = key?.id;
    if (!keyId || keyId === null) {
      printAction(`Skipping one key because is undefined or null`);
      continue;
    }
  
    await wait();
  
    const translations = await fetchTranslationsForKey(keyId);
    const missingTranslationsForKey = getMissingTranslations(langs, translations);
  
    missingTranslationsForKey.forEach(async (lang) => {
      const mainTranslation = translations.find(translation => translation?.locale?.code === mainTranslationCode);
      if (!mainTranslation) {
        printAction(`No main translation found for key ${keyId}, skipping...`);
        return;
      }
      
      const translation = await translateKey(mainTranslation.content, lang);
  
      // If dryRun mode is enabled, do not send the translation and stop here
      if (dryRun || !translation) {
        return;
      }
  
      // createTranslationInPhrase(keyId, translation?.text, locales.find(locale => locale.code === lang).id);
    });
  }
};

if (dryRun) {
  console.log("Dry run mode is enabled, no translations will be updated");
}

const locales = await fetchLocales();
const langs = locales.map(locale => locale.code);
const keys = await fetchKeys();

await start(keys);
