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
      history: local.getHistory(),
      progress: local.getProgress({}),
      favorites: local.getFavorites(),
      updated_at: new Date().toISOString()
    };
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

  function mergeRemote(remote) {
    if (!remote) return;
    const history = mergeUnique(remote.history, local.getHistory(), item => item.id || `${item.date}-${item.questions?.length}`);
    const favorites = mergeUnique(remote.favorites, local.getFavorites(), item => item.reference);
    const localProgress = local.getProgress({});
    const progress = {
      ...(remote.progress || {}), ...localProgress,
      answered: Math.max(remote.progress?.answered || 0, localProgress.answered || 0),
      correct: Math.max(remote.progress?.correct || 0, localProgress.correct || 0),
      bestStreak: Math.max(remote.progress?.bestStreak || 0, localProgress.bestStreak || 0),
      errors: mergeUnique(remote.progress?.errors, localProgress.errors, item => `${item.question}|${item.reference}`),
      usedReferences: [...new Set([...(remote.progress?.usedReferences || []), ...(localProgress.usedReferences || [])])].slice(-1000),
      books: mergeCounters(remote.progress?.books, localProgress.books),
      days: mergeCounters(remote.progress?.days, localProgress.days),
      flagged: mergeUnique(remote.progress?.flagged, localProgress.flagged, item => `${item.question}|${item.reference}`)
    };
    local.saveHistory(history); local.saveProgress(progress); local.saveFavorites(favorites);
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
