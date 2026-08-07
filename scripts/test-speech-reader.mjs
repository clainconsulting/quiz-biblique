import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
vm.runInThisContext(fs.readFileSync(new URL('../speech-reader.js', import.meta.url), 'utf8'));
const chapter = { verses: [
  { number: 1, text: 'Au commencement', originalText: 'بِسْمِ' },
  { number: 2, text: 'Deuxième verset', originalText: '' }
] };
assert.deepEqual(QuizSpeech.buildQueue(chapter, 'fr').map(item => item.text), ['Au commencement', 'Deuxième verset']);
assert.equal(QuizSpeech.buildQueue(chapter, 'ar')[0].lang, 'ar');
assert.equal(QuizSpeech.buildQueue(chapter, 'ar')[1].text, 'Deuxième verset', 'la traduction doit servir de repli si le texte original manque');
assert.deepEqual(QuizSpeech.buildQueue(chapter, 'fr', 1).map(item => item.verse), [2]);
console.log('File de lecture audio vérifiée.');
