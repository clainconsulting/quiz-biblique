const state = { bible: null, verses: [] };
const statusEl = document.querySelector('#status');
const scopeEl = document.querySelector('#scope');
const countEl = document.querySelector('#count');
const drawButton = document.querySelector('#draw');
const resultsEl = document.querySelector('#results');

async function loadBible() {
  try {
    const response = await fetch('bible.json');
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    state.bible = await response.json();
    state.verses = flattenBible(state.bible.books);
    statusEl.textContent = `${state.bible.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets chargés`;
    statusEl.className = 'status ready';
    [scopeEl, countEl, drawButton].forEach(element => { element.disabled = false; });
  } catch (error) {
    statusEl.textContent = `Impossible de charger la Bible : ${error.message}`;
    statusEl.className = 'status error';
  }
}

function flattenBible(books) {
  return books.flatMap((book, bookIndex) =>
    book.chapters.flatMap(chapter =>
      chapter.verses.map(verse => ({
        book: book.name,
        bookIndex,
        chapter: chapter.number,
        verse: verse.number,
        text: verse.text.trim()
      }))
    )
  );
}

function availableVerses(scope) {
  if (scope === 'old') return state.verses.filter(v => v.bookIndex < 39);
  if (scope === 'new') return state.verses.filter(v => v.bookIndex >= 39);
  return state.verses;
}

function sample(items, amount) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, amount);
}

function drawPassages() {
  const passages = sample(availableVerses(scopeEl.value), Number(countEl.value));
  resultsEl.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = 'Passages sélectionnés';
  resultsEl.append(title);
  passages.forEach(passage => {
    const article = document.createElement('article');
    article.className = 'passage';
    const reference = document.createElement('div');
    reference.className = 'reference';
    reference.textContent = `${passage.book} ${passage.chapter}:${passage.verse}`;
    const text = document.createElement('p');
    text.textContent = passage.text;
    article.append(reference, text);
    resultsEl.append(article);
  });
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

drawButton.addEventListener('click', drawPassages);
loadBible();
