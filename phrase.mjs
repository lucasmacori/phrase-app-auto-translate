import { printAction } from "./index.mjs";

const phraseAuth = process.env.PHRASE_AUTH;
const phraseProjectId = process.env.PHRASE_PROJECT_ID;

const options = {
  headers: {
    Authorization: phraseAuth,
  }
};
const postOptions = {
  ...options,
  'Content-Type': 'application/json'
}

export const fetchLocales = async () => {
  printAction("Fetching locales");
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/locales`, options);
  if (!response.ok) {
    throw new Error(`Could not fetch locales. Status: ${response.status}`);
  }
  return await response.json();
}

export const fetchKeys = async () => {
  printAction("Fetching keys");
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/keys`, options);
  if (!response.ok) {
    throw new Error(`Could not fetch keys. Status: ${response.status}`);
  }
  return await response.json();
}

export const fetchTranslationsForKey = async (keyId) => {
  printAction(`Fetching translations for key ${keyId}`);
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/keys/${keyId}/translations`, options);
  if (!response.ok) {
    throw new Error(`Could not fetch translations. Status: ${response.status}`);
  }
  const data = await response.json();
  return data.map(key => ({
    id: key?.id,
    content: key?.content,
    locale: key?.locale,
    state: key?.state
  }));
};

export const createTranslationInPhrase = async (keyId, content, locale) => {
  printAction(`Sending ${translation?.text} for key ${keyId} for ${lang}`);
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/translations`, {
    body: JSON.stringify({
      content,
      key_id: keyId,
      locale_id: locale
    }),
    method: 'POST',
    headers: postOptions,
  });
  if (!response.ok) {
    throw new Error(`Could not create translation. Status: ${response.status}`);
  }
};