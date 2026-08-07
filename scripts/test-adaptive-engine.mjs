import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

vm.runInThisContext(fs.readFileSync(new URL('../adaptive-engine.js', import.meta.url), 'utf8'));

const now = Date.parse('2026-08-07T12:00:00Z');
const verses = [
  { book: 'Genèse', chapter: 1, verse: 1 },
  { book: 'Exode', chapter: 3, verse: 14 },
  { book: 'Psaumes', chapter: 23, verse: 1 },
  { book: 'Jean', chapter: 3, verse: 16 }
];
const attempt = (date, corpus, reference, correct) => ({
  date, corpus, questions: [{ reference, selectedIndex: correct ? 0 : 1, correctIndex: 0 }]
});

const history = [
  attempt('2026-08-01T12:00:00Z', 'bible', 'Exode 3:14', false),
  attempt('2026-08-07T08:00:00Z', 'bible', 'Jean 3:16', true),
  attempt('2026-08-01T12:00:00Z', 'coran', 'Exode 3:14', true),
  { date: '2026-08-01T12:00:00Z', questions: [{ reference: 'Genèse 1:1', selectedIndex: 1, correctIndex: 0 }] }
];
const plan = AdaptiveQuiz.buildPlan({
  verses, history, corpus: 'bible', now, count: 3, random: () => 0,
  progress: { usedReferences: ['Psaumes 23:1'], books: { Exode: { answered: 4, correct: 1 } } }
});

assert.equal(plan.items[0].reference, 'Exode 3:14', 'une ancienne erreur échue doit être prioritaire');
assert.equal(plan.items[0].category, 'spaced-review');
assert.ok(!plan.items.some(item => item.reference === 'Jean 3:16'), 'une réussite très récente doit être écartée si assez de contenu existe');
assert.equal(plan.eventCount, 3, 'les anciens résultats sans corpus restent associés à la Bible');
assert.match(plan.summary, /ancienne erreur|Exode/);

const easyHistory = Array.from({ length: 8 }, (_, index) => attempt(`2026-07-${String(index + 1).padStart(2, '0')}T12:00:00Z`, 'bible', 'Genèse 1:1', index < 3));
assert.equal(AdaptiveQuiz.buildPlan({ verses, history: easyHistory, corpus: 'bible', now, count: 2 }).difficulty, 'facile');
assert.equal(AdaptiveQuiz.buildPlan({ verses, history: [], corpus: 'torah', now, count: 2 }).items.length, 2, 'le moteur complète avec des passages aléatoires sans historique');
assert.equal(AdaptiveQuiz.historyEvents(history, 'torah').length, 0, 'la Torah ne doit reprendre ni la Bible, ni les historiques hérités');

console.log('Moteur adaptatif vérifié.');
