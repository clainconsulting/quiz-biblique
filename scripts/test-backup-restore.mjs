import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
globalThis.window = globalThis;
vm.runInThisContext(fs.readFileSync(new URL('../data-store.js', import.meta.url), 'utf8'));

QuizData.saveHistory([{ id: 'bible-1' }]);
QuizData.saveProgress({ answered: 12, study: { notes: { 'Jean 3:16': { text: 'Note' } } } });
QuizData.saveFavorites([{ reference: 'Jean 3:16' }]);
const snapshot = QuizData.exportSnapshot();
assert.equal(snapshot.version, 3);

QuizData.saveHistory([]); QuizData.saveProgress({}); QuizData.saveFavorites([]);
QuizData.importSnapshot(snapshot);
assert.equal(QuizData.getHistory()[0].id, 'bible-1');
assert.equal(QuizData.getProgress({}).answered, 12);
assert.equal(QuizData.getFavorites()[0].reference, 'Jean 3:16');
assert.throws(() => QuizData.importSnapshot({ version: 3 }), /Sauvegarde invalide/);
console.log('Sauvegarde générale et restauration vérifiées.');
