import assert from 'node:assert/strict';
import fs from 'node:fs';

const corpus = JSON.parse(fs.readFileSync(new URL('../history-france.json', import.meta.url), 'utf8'));
assert.equal(corpus.books.length, 12);
const events = corpus.books.flatMap(book => book.chapters.flatMap(chapter => chapter.verses));
assert.equal(events.length, 84);
assert.ok(events.every(event => event.title && event.date && Number.isFinite(event.sortDate) && event.text && /^https:\/\//.test(event.sourceUrl)));
assert.equal(new Set(events.map(event => `${event.date}|${event.title}`)).size, events.length);

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
assert.match(app, /histoire:\s*\{/);
assert.match(app, /function dateQuestion/);
assert.match(app, /function chronologyQuestion/);
assert.match(app, /history-france\.json/);
console.log('Corpus Histoire de France et jeux historiques vérifiés.');
