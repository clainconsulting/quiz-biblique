(function (global) {
  'use strict';
  const DAY = 86400000;
  const dateKey = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10); };
  const questionCorrect = question => Number(question?.selectedIndex) === Number(question?.correctIndex);
  const bookFromReference = reference => String(reference || '').replace(/\s+\d+[.:].*$/, '').trim() || 'Non classé';
  const belongsToCorpus = (attempt, corpus) => attempt?.corpus === corpus || (!attempt?.corpus && corpus === 'bible');
  function currentStreak(activeKeys, now) {
    const active = new Set(activeKeys); const cursor = new Date(now); cursor.setUTCHours(0, 0, 0, 0);
    if (!active.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
    let streak = 0;
    while (active.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
    return streak;
  }
  function buildReport({ history = [], corpus = 'bible', period = 30, now = Date.now() } = {}) {
    const days = Math.max(1, Number(period) || 30); const end = new Date(now); end.setUTCHours(23, 59, 59, 999);
    const start = new Date(end.getTime() - ((days - 1) * DAY)); start.setUTCHours(0, 0, 0, 0);
    const attempts = history.filter(attempt => belongsToCorpus(attempt, corpus) && new Date(attempt.date).getTime() >= start.getTime() && new Date(attempt.date).getTime() <= end.getTime());
    const daily = Array.from({ length: days }, (_, index) => ({ date: new Date(start.getTime() + index * DAY).toISOString().slice(0, 10), attempts: 0, answered: 0, correct: 0, rate: 0 }));
    const dailyMap = new Map(daily.map(item => [item.date, item])); const books = new Map(); const modes = new Map(); let answered = 0; let correct = 0;
    attempts.forEach(attempt => {
      const day = dailyMap.get(dateKey(attempt.date)); const questions = Array.isArray(attempt.questions) ? attempt.questions : []; if (day) day.attempts += 1;
      questions.forEach(question => {
        const isCorrect = questionCorrect(question); answered += 1; if (isCorrect) correct += 1; if (day) { day.answered += 1; if (isCorrect) day.correct += 1; }
        const book = bookFromReference(question.reference); const bookStats = books.get(book) || { label: book, answered: 0, correct: 0 }; bookStats.answered += 1; if (isCorrect) bookStats.correct += 1; books.set(book, bookStats);
        const mode = question.type || 'qcm'; const modeStats = modes.get(mode) || { label: mode, answered: 0, correct: 0 }; modeStats.answered += 1; if (isCorrect) modeStats.correct += 1; modes.set(mode, modeStats);
      });
    });
    daily.forEach(item => { item.rate = item.answered ? Math.round((item.correct / item.answered) * 100) : 0; });
    const rankedBooks = [...books.values()].map(item => ({ ...item, rate: Math.round((item.correct / item.answered) * 100) })).filter(item => item.answered >= 2).sort((a, b) => b.rate - a.rate || b.answered - a.answered);
    const rankedModes = [...modes.values()].map(item => ({ ...item, rate: Math.round((item.correct / item.answered) * 100) })).sort((a, b) => b.answered - a.answered);
    const activeKeys = daily.filter(item => item.attempts > 0).map(item => item.date);
    return { period: days, attempts: attempts.length, answered, correct, successRate: answered ? Math.round((correct / answered) * 100) : 0, activeDays: activeKeys.length, streak: currentStreak(activeKeys, now), daily, strongest: rankedBooks[0] || null, weakest: rankedBooks.length > 1 ? rankedBooks[rankedBooks.length - 1] : null, modes: rankedModes, recent: [...attempts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8) };
  }
  global.QuizAnalytics = { buildReport, bookFromReference };
})(typeof window === 'undefined' ? globalThis : window);
