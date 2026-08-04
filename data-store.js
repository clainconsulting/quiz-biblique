(function (global) {
  'use strict';

  const KEYS = {
    history: 'quiz-biblique-history-v2',
    legacyHistory: 'quiz-biblique-history',
    progress: 'quiz-biblique-progress-v2',
    favorites: 'quiz-biblique-favorites-v1'
  };

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const LocalDataStore = {
    mode: 'local',
    isAuthenticated: false,
    getHistory() {
      const current = read(KEYS.history, null);
      return Array.isArray(current) ? current : read(KEYS.legacyHistory, []);
    },
    saveHistory(history) { write(KEYS.history, history); },
    getProgress(defaultValue) { return { ...defaultValue, ...read(KEYS.progress, {}) }; },
    saveProgress(progress) { write(KEYS.progress, progress); },
    getFavorites() { const value = read(KEYS.favorites, []); return Array.isArray(value) ? value : []; },
    saveFavorites(favorites) { write(KEYS.favorites, favorites); },
    exportSnapshot() {
      return { version: 1, exportedAt: new Date().toISOString(), history: this.getHistory(), progress: read(KEYS.progress, {}), favorites: this.getFavorites() };
    }
  };

  // Cette interface sera remplacée par l’adaptateur Supabase sans modifier les écrans.
  global.QuizData = LocalDataStore;
})(window);
