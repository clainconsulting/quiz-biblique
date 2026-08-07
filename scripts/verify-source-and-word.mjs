import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
assert.match(appSource, /summary\.textContent = 'Voir le passage source'/);
assert.match(appSource, /original\.className = 'arabic-text'/);
assert.match(appSource, /french\.textContent = question\.sourceText/);
assert.match(appSource, /sourceText: question\.sourceText \|\| ''/);
assert.match(appSource, /sourceOriginalText: question\.sourceOriginalText \|\| ''/);

globalThis.window = globalThis;
globalThis.self = globalThis;
vm.runInThisContext(fs.readFileSync(new URL('../jszip.min.js', import.meta.url), 'utf8'));
vm.runInThisContext(fs.readFileSync(new URL('../word-export.js', import.meta.url), 'utf8'));

const history = [{
  corpus: 'coran', corpusLabel: 'Coran', edition: 'test', questions: [{
    type: 'qcm', question: 'Question de test ?', answers: ['A', 'B', 'C', 'D'],
    correctIndex: 0, explanation: 'Justification explicite.', reference: 'Al-Fatiha 1:1',
    sourceText: 'Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    sourceOriginalText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
  }]
}];

const blob = await QuizWord.createCarnet(history);
const zip = await JSZip.loadAsync(await blob.arrayBuffer());
const documentXml = await zip.file('word/document.xml').async('string');
assert.match(documentXml, /Passage source \(français\)/);
assert.match(documentXml, /Au nom d’Allah/);
assert.match(documentXml, /Texte arabe/);
assert.match(documentXml, /بِسْمِ اللَّهِ/);

const historyXml = await zip.file('customXml/item1.xml').async('string');
const encodedHistory = historyXml.match(/<quizHistory[^>]*>([\s\S]*?)<\/quizHistory>/)[1].trim();
const restored = JSON.parse(Buffer.from(encodedHistory, 'base64').toString('utf8'));
assert.equal(restored[0].questions[0].sourceText, history[0].questions[0].sourceText);
assert.equal(restored[0].questions[0].sourceOriginalText, history[0].questions[0].sourceOriginalText);
console.log('Volet source et export Word vérifiés.');
