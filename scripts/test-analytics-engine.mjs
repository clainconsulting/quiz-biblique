import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
vm.runInThisContext(fs.readFileSync(new URL('../analytics-engine.js', import.meta.url), 'utf8'));
const question = (reference, correct, type = 'qcm') => ({ reference, selectedIndex: correct ? 0 : 1, correctIndex: 0, type });
const history = [
  { date: '2026-08-07T08:00:00Z', corpus: 'bible', questions: [question('Jean 3:16', true), question('Jean 14:6', true)] },
  { date: '2026-08-06T08:00:00Z', corpus: 'bible', questions: [question('Exode 3:14', false), question('Exode 20:12', true, 'truefalse')] },
  { date: '2026-08-04T08:00:00Z', questions: [question('Jean 3:16', true)] },
  { date: '2026-08-07T08:00:00Z', corpus: 'coran', questions: [question('Al-Fatihah 1:1', false)] }
];
const bible = QuizAnalytics.buildReport({ history, corpus: 'bible', period: 7, now: Date.parse('2026-08-07T12:00:00Z') });
assert.equal(bible.attempts, 3); assert.equal(bible.answered, 5); assert.equal(bible.correct, 4); assert.equal(bible.successRate, 80); assert.equal(bible.activeDays, 3); assert.equal(bible.streak, 2); assert.equal(bible.strongest.label, 'Jean'); assert.equal(bible.weakest.label, 'Exode'); assert.equal(bible.daily.length, 7); assert.equal(bible.modes.find(mode => mode.label === 'truefalse').answered, 1);
const coran = QuizAnalytics.buildReport({ history, corpus: 'coran', period: 7, now: Date.parse('2026-08-07T12:00:00Z') });
assert.equal(coran.attempts, 1, 'les historiques doivent rester séparés par corpus'); assert.equal(coran.successRate, 0);
console.log('Tableau de progression vérifié.');
