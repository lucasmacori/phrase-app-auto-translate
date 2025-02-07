const phraseAuth = process.env.PHRASE_AUTH;
const phraseProjectId = process.env.PHRASE_PROJECT_ID;

export const fetchLocales = async () => {
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/locales`, {
    headers: {
      Authorization: phraseAuth,
    }
  });
  if (!response.ok) {
    throw new Error(`Could not fetch locales. Status: ${response.status}`);
  }
  return await response.json();
}

export const fetchKeys = async () => {
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/keys`, {
    headers: {
      Authorization: phraseAuth,
    }
  });
  if (!response.ok) {
    throw new Error(`Could not fetch keys. Status: ${response.status}`);
  }
  return await response.json();
}

export const fetchTranslationsForKey = async (keyId) => {
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/keys/${keyId}/translations`, {
    headers: {
      Authorization: phraseAuth,
    }
  });
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
  console.log(`locale is ${locale}`);
  const response = await fetch(`https://api.phrase.com/v2/projects/${phraseProjectId}/translations`, {
    body: JSON.stringify({
      content,
      key_id: keyId,
      locale_id: locale
    }),
    method: 'POST',
    headers: {
      Authorization: phraseAuth,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Could not create translation. Status: ${response.status}`);
  }
};