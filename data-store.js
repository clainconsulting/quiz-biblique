(function (global) {
  'use strict';

  const CORPORA = ['bible', 'torah', 'coran'];
  const ACTIVE_KEY = 'quiz-multicorpus-active-v1';
  const LEGACY_KEYS = {
    history: ['quiz-biblique-history-v2', 'quiz-biblique-history'],
    progress: ['quiz-biblique-progress-v2'],
    favorites: ['quiz-biblique-favorites-v1']
  };
  let activeCorpus = localStorage.getItem(ACTIVE_KEY) || 'bible';
  if (!CORPORA.includes(activeCorpus)) activeCorpus = 'bible';

  function key(kind, corpus = activeCorpus) { return `quiz-${corpus}-${kind}-v3`; }
  function read(storageKey, fallback) {
    try { return JSON.parse(localStorage.getItem(storageKey)) ?? fallback; }
    catch { return fallback; }
  }
  function write(storageKey, value) { localStorage.setItem(storageKey, JSON.stringify(value)); }
  function readLegacy(kind, fallback) {
    for (const storageKey of LEGACY_KEYS[kind] || []) {
      const value = read(storageKey, null);
      if (value !== null) return value;
    }
    return fallback;
  }
  function readCorpus(kind, corpus, fallback) {
    const current = read(key(kind, corpus), null);
    if (current !== null) return current;
    if (corpus === 'bible') {
      const legacy = readLegacy(kind, fallback);
      write(key(kind, corpus), legacy);
      return legacy;
    }
    return fallback;
  }
  function getAll(kind, fallbackFactory) {
    return Object.fromEntries(CORPORA.map(corpus => [corpus, readCorpus(kind, corpus, fallbackFactory())]));
  }
  function saveAll(kind, values, fallbackFactory) {
    CORPORA.forEach(corpus => write(key(kind, corpus), values?.[corpus] ?? fallbackFactory()));
  }
  function validateCorpusMap(value, kind) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Sauvegarde invalide : ${kind} absent.`);
    return Object.fromEntries(CORPORA.map(corpus => {
      const item = value[corpus];
      if (kind === 'progress') {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Sauvegarde invalide : progression ${corpus}.`);
      } else if (!Array.isArray(item)) throw new Error(`Sauvegarde invalide : ${kind} ${corpus}.`);
      return [corpus, item];
    }));
  }

  const LocalDataStore = {
    mode: 'local',
    isAuthenticated: false,
    corpora: [...CORPORA],
    getCorpus() { return activeCorpus; },
    setCorpus(corpus) {
      if (!CORPORA.includes(corpus)) throw new Error('Corpus inconnu.');
      activeCorpus = corpus;
      localStorage.setItem(ACTIVE_KEY, corpus);
    },
    getHistory() {
      const value = readCorpus('history', activeCorpus, []);
      return Array.isArray(value) ? value : [];
    },
    saveHistory(history) { write(key('history'), Array.isArray(history) ? history : []); },
    getProgress(defaultValue) {
      const value = readCorpus('progress', activeCorpus, {});
      return { ...defaultValue, ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}) };
    },
    saveProgress(progress) { write(key('progress'), progress || {}); },
    getFavorites() {
      const value = readCorpus('favorites', activeCorpus, []);
      return Array.isArray(value) ? value : [];
    },
    saveFavorites(favorites) { write(key('favorites'), Array.isArray(favorites) ? favorites : []); },
    getAllHistory() { return getAll('history', () => []); },
    getAllProgress() { return getAll('progress', () => ({})); },
    getAllFavorites() { return getAll('favorites', () => []); },
    saveAllHistory(values) { saveAll('history', values, () => []); },
    saveAllProgress(values) { saveAll('progress', values, () => ({})); },
    saveAllFavorites(values) { saveAll('favorites', values, () => []); },
    exportSnapshot() {
      return {
        version: 3,
        exportedAt: new Date().toISOString(),
        activeCorpus,
        history: this.getAllHistory(),
        progress: this.getAllProgress(),
        favorites: this.getAllFavorites()
      };
    },
    importSnapshot(snapshot) {
      if (!snapshot || typeof snapshot !== 'object' || Number(snapshot.version) < 2) throw new Error('Ce fichier n’est pas une sauvegarde compatible.');
      const history = validateCorpusMap(snapshot.history, 'history');
      const progress = validateCorpusMap(snapshot.progress, 'progress');
      const favorites = validateCorpusMap(snapshot.favorites, 'favorites');
      this.saveAllHistory(history); this.saveAllProgress(progress); this.saveAllFavorites(favorites);
      if (CORPORA.includes(snapshot.activeCorpus)) this.setCorpus(snapshot.activeCorpus);
      return true;
    }
  };

  global.QuizData = LocalDataStore;
})(window);
