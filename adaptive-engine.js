(function (global) {
  'use strict';

  const DAY = 86400000;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const referenceOf = verse => `${verse.book} ${verse.chapter}:${verse.verse}`;
  const questionCorrect = question => Number(question?.selectedIndex) === Number(question?.correctIndex);

  function historyEvents(history, corpus) {
    return (history || [])
      .filter(attempt => attempt?.corpus ? attempt.corpus === corpus : corpus === 'bible')
      .flatMap(attempt => (attempt.questions || []).map(question => ({
        date: new Date(attempt.date || 0).getTime(), reference: question.reference || '', correct: questionCorrect(question)
      })))
      .filter(event => event.reference && Number.isFinite(event.date))
      .sort((left, right) => left.date - right.date);
  }

  function difficultyFor(events) {
    const recent = events.slice(-20);
    if (recent.length < 5) return 'intermédiaire';
    const rate = recent.filter(event => event.correct).length / recent.length;
    if (rate < 0.55) return 'facile';
    if (rate >= 0.82) return 'difficile';
    return 'intermédiaire';
  }

  function buildPlan({ verses = [], history = [], progress = {}, corpus = 'bible', count = 10, now = Date.now(), random = Math.random }) {
    const events = historyEvents(history, corpus);
    const byReference = new Map();
    events.forEach(event => {
      const key = normalize(event.reference); const list = byReference.get(key) || [];
      list.push(event); byReference.set(key, list);
    });
    const recentSuccesses = new Set(events.filter(event => event.correct && now - event.date < 2 * DAY).map(event => normalize(event.reference)));
    const usedRecent = new Set((progress.usedReferences || []).slice(-12).map(normalize));
    const candidates = verses.map(verse => {
      const reference = referenceOf(verse); const refEvents = byReference.get(normalize(reference)) || [];
      const answered = refEvents.length; const correct = refEvents.filter(event => event.correct).length;
      const lastWrongIndex = refEvents.map(event => event.correct).lastIndexOf(false);
      const successesSinceError = lastWrongIndex < 0 ? 0 : refEvents.slice(lastWrongIndex + 1).filter(event => event.correct).length;
      const lastError = lastWrongIndex < 0 ? 0 : refEvents[lastWrongIndex].date;
      const reviewInterval = Math.min(30, Math.pow(3, successesSinceError)) * DAY;
      const dueError = Boolean(lastError && now >= lastError + reviewInterval);
      const book = progress.books?.[verse.book] || {}; const bookRate = book.answered ? book.correct / book.answered : null;
      const refRate = answered ? correct / answered : null;
      let score = random() * 8; let reason = `Nouveau passage de ${verse.book} pour élargir ton entraînement.`; let category = 'exploration';
      if (bookRate !== null && bookRate < 0.7) { score += (1 - bookRate) * 55; reason = `${verse.book} est à renforcer (${Math.round(bookRate * 100)} % de réussite).`; category = 'weak-book'; }
      if (refRate !== null && refRate < 0.7) { score += (1 - refRate) * 70; reason = `Cette référence fait partie de celles qui te réussissent le moins (${Math.round(refRate * 100)} %).`; category = 'weak-reference'; }
      if (dueError) { score += 120; reason = `Une ancienne erreur sur cette référence est arrivée à échéance pour une révision espacée.`; category = 'spaced-review'; }
      if (recentSuccesses.has(normalize(reference))) score -= 200;
      if (usedRecent.has(normalize(reference))) score -= 80;
      return { verse, reference, score, reason, category };
    });
    const ranked = candidates.sort((left, right) => right.score - left.score);
    const selected = ranked.slice(0, Math.min(Number(count) || 10, ranked.length));
    const difficulty = difficultyFor(events);
    const focus = selected[0];
    const summary = focus
      ? `${focus.reason} Niveau ${difficulty}, calculé d’après tes ${Math.min(events.length, 20)} derniers résultats.`
      : `Des passages aléatoires seront proposés en niveau ${difficulty}, faute de données suffisantes.`;
    return { difficulty, items: selected, summary, eventCount: events.length };
  }

  global.AdaptiveQuiz = { buildPlan, difficultyFor, historyEvents, normalize };
})(typeof window === 'undefined' ? globalThis : window);
