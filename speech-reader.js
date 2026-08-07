(function (global) {
  'use strict';
  function buildQueue(chapter, language = 'fr', verseIndex = null) {
    const verses = Array.isArray(chapter?.verses) ? chapter.verses : [];
    const selected = Number.isInteger(verseIndex) ? verses.slice(verseIndex, verseIndex + 1) : verses;
    return selected.map(verse => {
      const original = String(verse.originalText || '').trim();
      const translated = String(verse.text || '').trim();
      const text = language === 'ar' && original ? original : translated;
      return { verse: Number(verse.number), text, lang: language === 'ar' && original ? 'ar' : 'fr-FR' };
    }).filter(item => item.text);
  }
  global.QuizSpeech = { buildQueue };
})(typeof window === 'undefined' ? globalThis : window);
