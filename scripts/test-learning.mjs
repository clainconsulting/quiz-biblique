import assert from 'node:assert/strict';
import fs from 'node:fs';

const learning = JSON.parse(fs.readFileSync(new URL('../learning.json', import.meta.url), 'utf8'));
const keys = [
  'anglais', 'espagnol', 'allemand',
  'arithmetique', 'algebre', 'fractions', 'geometrie', 'mesures', 'logique',
  'arts-musique', 'litterature', 'sciences-nature', 'inventions', 'monde-societe'
];

for (const key of keys) {
  const corpus = learning[key];
  assert.equal(corpus?.books?.length, 4, `${key} doit contenir quatre thèmes`);
  const cards = corpus.books.flatMap(book => book.chapters.flatMap(chapter => chapter.verses));
  assert.equal(cards.length, 20, `${key} doit contenir vingt fiches`);
  assert.ok(cards.every(card => card.title && card.date && card.text.length >= 30 && /^https:\/\//.test(card.sourceUrl)), `${key} doit fournir des fiches complètes et sourcées`);
  assert.equal(new Set(cards.map(card => `${card.date}|${card.title}`)).size, cards.length, `${key} ne doit pas contenir de doublons`);
}

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const store = fs.readFileSync(new URL('../data-store.js', import.meta.url), 'utf8');
for (const heading of ['Langues étrangères', 'Mathématiques', 'Culture générale']) assert.match(html, new RegExp(heading));
for (const key of keys) {
  assert.match(html, new RegExp(`data-corpus="${key}"`));
  assert.match(app, new RegExp(`(?:'${key}'|${key}):`));
  assert.match(store, new RegExp(`'${key}'`));
}
assert.doesNotMatch(html, /<details class="environment-family[^>]*" open>/);
assert.doesNotMatch(html, /<details class="environment-subgroup" open>/);

console.log('Langues, mathématiques et culture générale : 14 collections et 280 fiches vérifiées.');
