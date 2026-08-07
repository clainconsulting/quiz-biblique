import fs from 'node:fs';
import path from 'node:path';

const archive = '/tmp/quiz-npm/quran-json-3.1.2.tgz';
const temporary = '/tmp/quiz-quran-source.json';
const target = path.resolve('quran.json');

if (!fs.existsSync(temporary)) {
  throw new Error(`Le fichier source ${temporary} doit être extrait avant l'exécution.`);
}

const chapters = JSON.parse(fs.readFileSync(temporary, 'utf8'));
const books = chapters.map((surah) => ({
  name: surah.transliteration,
  displayName: `${surah.id}. ${surah.transliteration} — ${surah.translation}`,
  arabicName: surah.name,
  category: surah.type === 'meccan' ? 'meccan' : 'medinan',
  chapters: [{
    number: surah.id,
    verses: surah.verses.map((verse) => ({
      number: verse.id,
      text: verse.translation,
      originalText: verse.text
    }))
  }]
}));

const payload = {
  corpus: 'coran',
  language: 'ar-fr',
  books,
  attribution: {
    arabic: 'Texte arabe issu du jeu de données quran-json, fondé sur un texte coranique Uthmani.',
    translation: 'Traduction française de Muhammad Hamidullah distribuée par quran-json.',
    source: 'quran-json 3.1.2',
    license: 'CC BY-SA 4.0',
    url: 'https://github.com/risan/quran-json'
  }
};

fs.writeFileSync(target, JSON.stringify(payload));
const verseRows = books.flatMap(book => book.chapters[0].verses.map(verse => ({ book, verse })));
const chunks = Array.from({ length: 6 }, () => []);
verseRows.forEach((row, index) => chunks[Math.min(5, Math.floor(index / Math.ceil(verseRows.length / 6)))].push(row));
chunks.forEach((rows, index) => {
  const grouped = new Map();
  rows.forEach(({ book, verse }) => {
    if (!grouped.has(book.name)) grouped.set(book.name, { ...book, chapters: [{ ...book.chapters[0], verses: [] }] });
    grouped.get(book.name).chapters[0].verses.push(verse);
  });
  fs.writeFileSync(path.resolve(`quran-${index + 1}.json`), JSON.stringify({ ...payload, books: [...grouped.values()] }));
});
console.log(`${books.length} sourates écrites dans ${target} et six fichiers Web depuis ${archive}`);
