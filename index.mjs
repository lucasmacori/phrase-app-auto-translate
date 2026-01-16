import * as deepl from 'deepl-node';
import 'dotenv/config';
import { createTranslationInPhrase, fetchKeyByName, fetchKeys, fetchLocales, fetchTranslationsForKey } from './phrase.mjs';

// Parse command-line arguments
const args = process.argv.slice(2);
const keyArgIndex = args.findIndex(arg => arg === '--key' || arg === '-k');
const specificKeyName = keyArgIndex !== -1 ? args[keyArgIndex + 1] : null;

const transformLang = (lang) =>  lang.indexOf('-') >= 0 ? lang.slice(0, lang.indexOf('-')) : lang;

const mainTranslationCode = process.env.MAIN_TRANSLATION_CODE ?? 'en';
const sourceLang = transformLang(mainTranslationCode);
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
const dryRun = process.env?.DRY_RUN?.toLowerCase() == "true";
const waitTime = process.env.WAIT_TIME_IN_MS ?? 200;
const verbose = process.env.VERBOSE ?? false;
const groupLanguages = process.env.GROUP_LANGUAGES?.toLowerCase() != "false";

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
  printAction(`Translating ${content} to ${targetLang}`);
  try {
    return await translator.translateText(content, sourceLang, targetLang);
  } catch (error) {
    console.log("[ERROR]", error);
    return;
  }
};

const translateMissingTranslations = async (keyId, langs, translations) => {
  let translatedLangs = new Map();
  console.log(langs, translations);
  const missingTranslationsForKey = getMissingTranslations(langs, translations);

  for (const lang of missingTranslationsForKey) {
    const mainTranslation = translations.find(translation => translation?.locale?.code === mainTranslationCode);
    if (!mainTranslation) {
      printAction(`No main translation found for key ${keyId}, skipping...`);
      continue;
    }
     
    const tranformedTargetLang = transformLang(lang);
    let translation = translatedLangs.get(tranformedTargetLang);
    if (!translation) {
      translation = await translateKey(mainTranslation.content, lang);

      if (groupLanguages) {
        translatedLangs.set(tranformedTargetLang, translation);
      }
    } else {
      printAction(`Translation for ${tranformedTargetLang} already exists, using it instead of retranslating... To avoid this, disable groupLanguages setting`);
    }

    // If dryRun mode is enabled, do not send the translation and stop here
    if (dryRun || !translation) {
      continue;
    }

    createTranslationInPhrase(keyId, translation?.text, locales.find(locale => locale.code === lang).id);
  };
}

const start = async (keys) => {
  if (dryRun) {
    console.log("Dry run mode is enabled, no translations will be updated");
  }

  for (const key of keys) {
    const keyId = key?.id;
    if (!keyId || keyId === null) {
      printAction(`Skipping one key because is undefined or null`);
      continue;
    }
  
    await wait();
  
    const translations = await fetchTranslationsForKey(keyId);
    await translateMissingTranslations(keyId, langs, translations);
  }
};

const locales = await fetchLocales();
const langs = locales.map(locale => locale.code);

let keys;
if (specificKeyName) {
  console.log(`Translating specific key: ${specificKeyName}`);
  const key = await fetchKeyByName(specificKeyName);
  keys = [key];
} else {
  keys = await fetchKeys();
}

await start(keys);
