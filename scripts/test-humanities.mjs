import assert from 'node:assert/strict';
import fs from 'node:fs';

const humanities = JSON.parse(fs.readFileSync(new URL('../humanities.json', import.meta.url), 'utf8'));
const expected = {
  'histoire-reunion': 20,
  'histoire-monde': 30,
  'geographie-france': 20,
  'geographie-reunion': 20,
  'geographie-monde': 20,
  'reperes-monde': 20
};

for (const [key, expectedCount] of Object.entries(expected)) {
  const corpus = humanities[key];
  assert.ok(corpus?.books?.length >= 3, `${key} doit contenir plusieurs rubriques`);
  const facts = corpus.books.flatMap(book => book.chapters.flatMap(chapter => chapter.verses));
  assert.equal(facts.length, expectedCount, `${key} doit contenir ${expectedCount} fiches`);
  assert.ok(facts.every(fact => fact.title && fact.date && fact.text && /^https:\/\//.test(fact.sourceUrl)), `${key} doit fournir des fiches sourcées`);
  assert.equal(new Set(facts.map(fact => `${fact.date}|${fact.title}`)).size, facts.length, `${key} ne doit pas contenir de doublons`);
}

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const store = fs.readFileSync(new URL('../data-store.js', import.meta.url), 'utf8');
assert.match(html, /Histoire &amp; Géographie/);
assert.doesNotMatch(html, /<details class="environment-family[^>]*" open>/, 'les grands thèmes doivent être fermés au chargement');
assert.ok((html.match(/<details class="environment-subgroup">/g) || []).length >= 3, 'les sous-thèmes doivent être des accordéons fermés');
assert.doesNotMatch(html, /<details class="environment-subgroup" open>/, 'les sous-thèmes doivent être fermés au chargement');
for (const key of Object.keys(expected)) {
  assert.match(html, new RegExp(`data-corpus="${key}"`));
  assert.match(app, new RegExp(`'${key}'`));
  assert.match(store, new RegExp(`'${key}'`));
}

console.log('Univers Histoire & Géographie et 130 fiches vérifiés.');
