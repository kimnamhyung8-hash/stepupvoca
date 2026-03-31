import { LIGHTWEIGHT_MODEL } from './apiUtils';
import { useState, useEffect } from 'react';

export const useGlobalTranslate = () => {
  const [isGlobalTranslateOn, setIsGlobalTranslateOn] = useState(() => {
    return localStorage.getItem('vq_global_translate') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vq_global_translate') {
        setIsGlobalTranslateOn(e.newValue === 'true');
      }
    };
    const handleCustomEvent = () => {
      setIsGlobalTranslateOn(localStorage.getItem('vq_global_translate') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vq_global_translate_toggle', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vq_global_translate_toggle', handleCustomEvent);
    };
  }, []);

  const toggleGlobalTranslate = () => {
    const newValue = !isGlobalTranslateOn;
    localStorage.setItem('vq_global_translate', String(newValue));
    setIsGlobalTranslateOn(newValue);
    window.dispatchEvent(new Event('vq_global_translate_toggle'));
  };

  return { isGlobalTranslateOn, toggleGlobalTranslate };
};

/**
 * Gemini API를 사용하여 텍스트를 대상 언어로 번역합니다.
 */
export const translateContent = async (
  text: string,
  targetLang: string,
  apiKey: string,
  isHtml: boolean = false
): Promise<string> => {
  const prompt = isHtml 
    ? `Translate the following HTML content into the language code "${targetLang}".
IMPORTANT: Preserve all HTML tags, attributes (src, class, etc.), and structure EXACTLY. ONLY translate the visible text content inside the tags.
Content:
"${text}"`
    : `Translate the following text into the language code "${targetLang}".
If the text is already in that language, return it as is.
Text to translate:
"${text}"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Translation failed');
  }

  const data = await response.json();
  const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Remove potential quotes or markdown fences if AI adds them
  return translatedText.replace(/^"|"$/g, '').trim();
};
