(function (global) {
  'use strict';

  const local = global.QuizData;
  const config = global.QUIZ_CONFIG || {};
  const sdk = global.supabase;
  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey && sdk?.createClient);
  const client = configured ? sdk.createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  let session = null;
  let syncTimer = null;

  function snapshot() {
    return {
      history: local.getAllHistory(),
      progress: local.getAllProgress(),
      favorites: local.getAllFavorites(),
      updated_at: new Date().toISOString()
    };
  }

  const CORPORA = local.corpora || ['bible', 'torah', 'coran'];
  function corpusMap(value, fallbackFactory) {
    if (value && typeof value === 'object' && !Array.isArray(value) && CORPORA.some(corpus => corpus in value)) {
      return Object.fromEntries(CORPORA.map(corpus => [corpus, value[corpus] ?? fallbackFactory()]));
    }
    return Object.fromEntries(CORPORA.map(corpus => [corpus, corpus === 'bible' ? (value ?? fallbackFactory()) : fallbackFactory()]));
  }

  function mergeUnique(left, right, key) {
    const values = new Map();
    [...(left || []), ...(right || [])].forEach(item => values.set(key(item), item));
    return [...values.values()];
  }

  function mergeCounters(left = {}, right = {}) {
    const merged = { ...left };
    Object.entries(right).forEach(([key, value]) => {
      if (typeof value === 'number') merged[key] = Math.max(Number(merged[key]) || 0, value);
      else if (value && typeof value === 'object') {
        merged[key] = {
          answered: Math.max(merged[key]?.answered || 0, value.answered || 0),
          correct: Math.max(merged[key]?.correct || 0, value.correct || 0)
        };
      }
    });
    return merged;
  }

  function mergeProgress(remoteProgress = {}, localProgress = {}) {
    const remoteStudy = remoteProgress.study || {};
    const localStudy = localProgress.study || {};
    const study = new Date(localStudy.updatedAt || 0) >= new Date(remoteStudy.updatedAt || 0) ? localStudy : remoteStudy;
    return {
      ...remoteProgress, ...localProgress,
      answered: Math.max(remoteProgress.answered || 0, localProgress.answered || 0),
      correct: Math.max(remoteProgress.correct || 0, localProgress.correct || 0),
      bestStreak: Math.max(remoteProgress.bestStreak || 0, localProgress.bestStreak || 0),
      errors: mergeUnique(remoteProgress.errors, localProgress.errors, item => `${item.question}|${item.reference}`),
      usedReferences: [...new Set([...(remoteProgress.usedReferences || []), ...(localProgress.usedReferences || [])])].slice(-1000),
      books: mergeCounters(remoteProgress.books, localProgress.books),
      days: mergeCounters(remoteProgress.days, localProgress.days),
      flagged: mergeUnique(remoteProgress.flagged, localProgress.flagged, item => `${item.question}|${item.reference}`),
      study
    };
  }

  function mergeRemote(remote) {
    if (!remote) return;
    const remoteHistory = corpusMap(remote.history, () => []);
    const remoteProgress = corpusMap(remote.progress, () => ({}));
    const remoteFavorites = corpusMap(remote.favorites, () => []);
    const localHistory = local.getAllHistory();
    const localProgress = local.getAllProgress();
    const localFavorites = local.getAllFavorites();
    const history = {}; const progress = {}; const favorites = {};
    CORPORA.forEach(corpus => {
      history[corpus] = mergeUnique(remoteHistory[corpus], localHistory[corpus], item => item.id || `${item.date}-${item.questions?.length}`);
      favorites[corpus] = mergeUnique(remoteFavorites[corpus], localFavorites[corpus], item => item.reference);
      progress[corpus] = mergeProgress(remoteProgress[corpus], localProgress[corpus]);
    });
    local.saveAllHistory(history); local.saveAllProgress(progress); local.saveAllFavorites(favorites);
  }

  async function pull() {
    if (!session?.user) return;
    const { data, error } = await client.from('user_bible_data').select('history, progress, favorites, updated_at').eq('user_id', session.user.id).maybeSingle();
    if (error) throw error;
    mergeRemote(data);
    global.dispatchEvent(new CustomEvent('quizdata:remote-loaded'));
  }

  async function push() {
    if (!session?.user) return;
    const data = snapshot();
    const { error } = await client.from('user_bible_data').upsert({ user_id: session.user.id, ...data }, { onConflict: 'user_id' });
    if (error) throw error;
    global.dispatchEvent(new CustomEvent('quizdata:synced', { detail: { at: data.updated_at } }));
  }

  function queuePush() {
    if (!session?.user) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => push().catch(error => global.dispatchEvent(new CustomEvent('quizdata:sync-error', { detail: error }))), 700);
  }

  const adapter = {
    ...local,
    mode: configured ? 'cloud-ready' : 'local',
    configured,
    client,
    get isAuthenticated() { return Boolean(session?.user); },
    get user() { return session?.user || null; },
    saveHistory(value) { local.saveHistory(value); queuePush(); },
    saveProgress(value) { local.saveProgress(value); queuePush(); },
    saveFavorites(value) { local.saveFavorites(value); queuePush(); },
    exportSnapshot() { return local.exportSnapshot(); },
    async importSnapshot(value) { local.importSnapshot(value); if (session?.user) await push(); },
    setCorpus(value) { local.setCorpus(value); },
    getCorpus() { return local.getCorpus(); },
    async initialize() {
      if (!client) return null;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data.session;
      if (session) await pull();
      client.auth.onAuthStateChange((event, nextSession) => {
        session = nextSession;
        global.dispatchEvent(new CustomEvent('quizdata:auth-changed', { detail: { event, user: session?.user || null } }));
        if (session && event === 'SIGNED_IN') setTimeout(() => pull().then(push).catch(error => global.dispatchEvent(new CustomEvent('quizdata:sync-error', { detail: error }))), 0);
      });
      return session;
    },
    async signUp(email, password, displayName) {
      if (!client) throw new Error('Supabase n’est pas encore configuré.');
      const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      if (!client) throw new Error('Supabase n’est pas encore configuré.');
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async requestPasswordReset(email) {
      if (!client) throw new Error('Supabase n’est pas encore configuré.');
      const redirectTo = `${global.location.origin}${global.location.pathname}?recovery=1`;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    async updatePassword(password) {
      if (!client) throw new Error('Supabase n’est pas encore configuré.');
      const { data, error } = await client.auth.updateUser({ password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (!client) return;
      await push();
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    async syncNow() { await pull(); await push(); }
  };

  global.QuizData = adapter;
})(window);
