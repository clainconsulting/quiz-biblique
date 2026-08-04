const API_URL = 'https://quiz-biblique-api.thomas-clain974.workers.dev';
const HISTORY_KEY = 'quiz-biblique-history-v2';
const PROGRESS_KEY = 'quiz-biblique-progress-v2';
const OLD_HISTORY_KEY = 'quiz-biblique-history';
const DAILY_TARGET = 20;
const BIBLE_CATEGORIES = [
  { id: 'pentateuch', label: 'Pentateuque', start: 0, end: 4 },
  { id: 'historical', label: 'Livres historiques', start: 5, end: 16 },
  { id: 'poetic', label: 'Livres poétiques et de sagesse', start: 17, end: 21 },
  { id: 'major-prophets', label: 'Prophètes majeurs', start: 22, end: 26 },
  { id: 'minor-prophets', label: 'Prophètes mineurs', start: 27, end: 38 },
  { id: 'gospels', label: 'Évangiles', start: 39, end: 42 },
  { id: 'acts', label: 'Actes des Apôtres', start: 43, end: 43 },
  { id: 'pauline-epistles', label: 'Épîtres de Paul', start: 44, end: 56 },
  { id: 'general-epistles', label: 'Épîtres générales', start: 57, end: 64 },
  { id: 'revelation', label: 'Apocalypse', start: 65, end: 65 }
];

const state = {
  books: [], verses: [], questions: [], current: 0, score: 0, answered: false,
  attemptSaved: false, currentAttempt: null, timerId: null, timeLeft: 0,
  history: loadArray(HISTORY_KEY, loadArray(OLD_HISTORY_KEY, [])),
  progress: loadObject(PROGRESS_KEY, { answered: 0, correct: 0, streak: 0, bestStreak: 0, errors: [], usedReferences: [], books: {}, days: {}, flagged: [] })
};

const $ = selector => document.querySelector(selector);
const elements = {
  setup: $('#setup'), dashboard: $('#dashboard'), help: $('#help'), status: $('#status'),
  scope: $('#scope'), book: $('#book'), books: $('#books'), category: $('#category'), bookField: $('#book-field'), booksField: $('#books-field'), categoryField: $('#category-field'), searchField: $('#search-field'), searchTerm: $('#search-term'), searchHelp: $('#search-help'),
  gameMode: $('#game-mode'), difficulty: $('#difficulty'), count: $('#count'), challenge: $('#challenge'), start: $('#start'),
  quiz: $('#quiz'), progress: $('#progress'), progressBar: $('#progress-bar'), timer: $('#timer'), score: $('#score'), questionType: $('#question-type'),
  question: $('#question'), answers: $('#answers'), feedback: $('#feedback'), report: $('#report'), next: $('#next'),
  result: $('#result'), finalScore: $('#final-score'), finalMessage: $('#final-message'), resultStats: $('#result-stats'), restart: $('#restart'),
  reviewErrors: $('#review-errors'), updateWord: $('#update-word'), createWord: $('#create-word'), wordFile: $('#word-file'), wordContent: $('#word-content'),
  statsGrid: $('#stats-grid'), bookProgress: $('#book-progress'), dailyGoal: $('#daily-goal'), dailyBar: $('#daily-bar'), flaggedCount: $('#flagged-count'), resetProgress: $('#reset-progress')
};

function loadArray(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; } catch { return fallback; } }
function loadObject(key, fallback) { try { return { ...fallback, ...(JSON.parse(localStorage.getItem(key)) || {}) }; } catch { return fallback; } }
function saveState() { localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)); localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function questionKey(question) { return normalize(`${question.question}|${question.reference}`).replace(/\s+/g, ' ').trim(); }
function bookFromReference(reference) {
  const ref = normalize(reference);
  return state.books.find(book => ref.startsWith(normalize(book.name)))?.name || 'Autres';
}

async function loadBible() {
  try {
    const response = await fetch('bible.json');
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    const bible = await response.json();
    state.books = bible.books;
    state.verses = flattenBible(bible.books);
    const options = bible.books.map((book, index) => new Option(`${index < 39 ? 'AT' : 'NT'} — ${book.name}`, String(index)));
    elements.book.replaceChildren(...options.map(option => option.cloneNode(true)));
    elements.books.replaceChildren(...options);
    elements.category.replaceChildren(...BIBLE_CATEGORIES.map(category => new Option(category.label, category.id)));
    elements.status.textContent = `${bible.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets prêts`;
    elements.status.className = 'status ready';
    [elements.scope, elements.gameMode, elements.difficulty, elements.count, elements.challenge, elements.start].forEach(element => { element.disabled = false; });
    updateDashboard();
  } catch (error) {
    elements.status.textContent = `Impossible de charger la Bible : ${error.message}`;
    elements.status.className = 'status error';
  }
}

function flattenBible(books) {
  return books.flatMap((book, bookIndex) => book.chapters.flatMap((chapter, chapterIndex) => chapter.verses.map((verse, verseIndex) => ({
    book: book.name, bookIndex, chapterIndex, verseIndex, chapter: chapter.number, verse: verse.number, text: verse.text.trim()
  }))));
}

function eligibleVerses() {
  const scope = elements.scope.value;
  let verses = state.verses;
  if (scope === 'old') verses = verses.filter(item => item.bookIndex < 39);
  if (scope === 'new') verses = verses.filter(item => item.bookIndex >= 39);
  if (scope === 'book') verses = verses.filter(item => item.bookIndex === Number(elements.book.value));
  if (scope === 'books') {
    const selected = new Set([...elements.books.selectedOptions].map(option => Number(option.value)));
    if (!selected.size) throw new Error('Sélectionne au moins un livre.');
    verses = verses.filter(item => selected.has(item.bookIndex));
  }
  if (scope === 'category') {
    const category = BIBLE_CATEGORIES.find(item => item.id === elements.category.value);
    if (!category) throw new Error('Catégorie biblique inconnue.');
    verses = verses.filter(item => item.bookIndex >= category.start && item.bookIndex <= category.end);
  }
  if (scope === 'famous') {
    const famous = new Set(['Genèse 1:1','Psaumes 23:1','Psaumes 119:105','Proverbes 3:5','Ésaïe 9:5','Ésaïe 40:31','Jérémie 29:11','Jean 3:16','Jean 14:6','Romains 8:28','Romains 12:2','1 Corinthiens 13:4','Philippiens 4:13','Hébreux 11:1'].map(normalize));
    verses = verses.filter(item => famous.has(normalize(`${item.book} ${item.chapter}:${item.verse}`)));
  }
  if (scope === 'search') {
    const term = normalize(elements.searchTerm.value.trim());
    if (term.length < 2) throw new Error('Saisis au moins deux lettres pour la recherche.');
    verses = verses.filter(item => normalize(item.text).includes(term));
    if (verses.length < 4) throw new Error(`Seulement ${verses.length} verset(s) trouvé(s). Essaie un terme plus général.`);
  }
  return verses;
}

function randomItems(items, amount) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy.slice(0, amount);
}

function selectSeeds(verses, amount) {
  const recent = new Set((state.progress.usedReferences || []).slice(-300));
  const fresh = verses.filter(verse => !recent.has(`${verse.book} ${verse.chapter}:${verse.verse}`));
  const pool = fresh.length >= amount ? fresh : verses;
  return randomItems(pool, amount);
}

function passageAround(seed) {
  const chapter = state.books[seed.bookIndex].chapters[seed.chapterIndex];
  const start = Math.max(0, seed.verseIndex - 1);
  const verses = chapter.verses.slice(start, start + 3);
  const first = verses[0].number;
  const last = verses[verses.length - 1].number;
  return { reference: `${seed.book} ${seed.chapter}:${first}${last !== first ? `-${last}` : ''}`, text: verses.map(verse => verse.text.trim()).join(' ') };
}

function referenceQuestion(seed, scoped) {
  const correct = `${seed.book} ${seed.chapter}:${seed.verse}`;
  const sameScope = scoped.filter(item => item !== seed && item.book !== seed.book);
  const distractors = randomItems(sameScope.length >= 3 ? sameScope : state.verses.filter(item => item !== seed), 3)
    .map(item => `${item.book} ${item.chapter}:${item.verse}`);
  return shuffleQuestion({
    type: 'reference', question: `De quelle référence provient ce verset ? « ${seed.text} »`,
    answers: [correct, ...distractors], correctIndex: 0,
    explanation: `Ce verset se trouve en ${correct}.`, reference: correct, sourceText: seed.text
  });
}

function trueFalseQuestion(seed, scoped) {
  const correctReference = `${seed.book} ${seed.chapter}:${seed.verse}`;
  const makeTrue = Math.random() >= 0.5;
  const other = randomItems(scoped.filter(item => item !== seed && item.book !== seed.book), 1)[0]
    || randomItems(state.verses.filter(item => item !== seed), 1)[0];
  const shownReference = makeTrue || !other ? correctReference : `${other.book} ${other.chapter}:${other.verse}`;
  return {
    type: 'truefalse',
    question: `Vrai ou faux ? Ce verset se trouve en ${shownReference} : « ${seed.text} »`,
    answers: ['Vrai', 'Faux'], correctIndex: makeTrue ? 0 : 1,
    explanation: makeTrue ? `Oui, il s’agit bien de ${correctReference}.` : `Non, ce verset se trouve en ${correctReference}.`,
    reference: correctReference, sourceText: seed.text
  };
}

const COMMON_WORDS = new Set('alors avec cette comme dans des elle elles encore entre est mais nous pour quand que qui ses son sous sur une vous votre leur leurs afin ainsi avait avoir celui cette ceux chaque donc dont était être fait font lui même notre parce plus sans tout toute tous très'.split(' '));
function completionQuestion(seed, scoped) {
  const words = seed.text.match(/[A-Za-zÀ-ÖØ-öø-ÿŒœ'-]+/g) || [];
  const candidates = words.filter(word => word.length >= 5 && !COMMON_WORDS.has(normalize(word)));
  const correctWord = candidates[Math.floor(Math.random() * candidates.length)] || words[Math.floor(words.length / 2)];
  if (!correctWord) return referenceQuestion(seed, scoped);
  const hiddenText = seed.text.replace(new RegExp(escapeRegex(correctWord), 'i'), '________');
  const distractorWords = randomItems(scoped.filter(item => item !== seed).flatMap(item => (item.text.match(/[A-Za-zÀ-ÖØ-öø-ÿŒœ'-]{5,}/g) || []))
    .filter(word => normalize(word) !== normalize(correctWord) && !COMMON_WORDS.has(normalize(word))), 12);
  const unique = [...new Map(distractorWords.map(word => [normalize(word), word])).values()].slice(0, 3);
  while (unique.length < 3) unique.push(['peuple', 'parole', 'maison'][unique.length]);
  return shuffleQuestion({
    type: 'completion', question: `Complète le verset : « ${hiddenText} »`, answers: [correctWord, ...unique], correctIndex: 0,
    explanation: `Le mot manquant est « ${correctWord} ».`, reference: `${seed.book} ${seed.chapter}:${seed.verse}`, sourceText: seed.text
  });
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function geminiQuestions(seeds, count) {
  if (count === 0) return [];
  const response = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passages: seeds.map(passageAround), difficulty: elements.difficulty.value, questionCount: count })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'La génération avec Gemini a échoué.');
  if (!Array.isArray(data.questions) || !data.questions.length) throw new Error('Aucune question reçue.');
  const allowedChapters = new Set(seeds.map(seed => referenceChapter(`${seed.book} ${seed.chapter}:1`)));
  const unique = new Map();
  data.questions.filter(question => isValidGeneratedQuestion(question) && allowedChapters.has(referenceChapter(question.reference))).forEach(question => {
    const prepared = shuffleQuestion({ ...question, type: 'qcm' });
    unique.set(questionKey(prepared), prepared);
  });
  const questions = [...unique.values()].slice(0, count);
  if (!questions.length) throw new Error('Les questions reçues ne sont pas exploitables.');
  return questions;
}

function referenceChapter(reference) {
  return normalize(reference).replace(/:\s*\d.*$/, '').trim();
}

function isValidGeneratedQuestion(question) {
  return typeof question?.question === 'string'
    && question.question.trim().length >= 8
    && Array.isArray(question.answers)
    && question.answers.length === 4
    && new Set(question.answers.map(answer => normalize(answer))).size === 4
    && Number.isInteger(Number(question.correctIndex))
    && Number(question.correctIndex) >= 0
    && Number(question.correctIndex) < 4
    && typeof question.reference === 'string'
    && /\d+\s*:/.test(question.reference);
}

async function createQuiz(forcedMode) {
  const mode = forcedMode || elements.gameMode.value;
  const count = Number(elements.count.value);
  if (mode === 'review') return startReview(count);
  let scoped;
  try { scoped = eligibleVerses(); } catch (error) { showSetupError(error.message); return; }
  const seeds = selectSeeds(scoped, count);
  setLoading(true);
  try {
    let questions = [];
    if (mode === 'reference') questions = seeds.map(seed => referenceQuestion(seed, scoped));
    else if (mode === 'completion') questions = seeds.map(seed => completionQuestion(seed, scoped));
    else if (mode === 'truefalse') questions = seeds.map(seed => trueFalseQuestion(seed, scoped));
    else if (mode === 'qcm') questions = await geminiQuestions(seeds, count);
    else {
      const geminiCount = Math.ceil(count / 2);
      const localSeeds = seeds.slice(geminiCount);
      let generated = [];
      try { generated = await geminiQuestions(seeds.slice(0, geminiCount), geminiCount); } catch { /* Le mode varié reste disponible sans API. */ }
      const makers = [referenceQuestion, completionQuestion, trueFalseQuestion];
      questions = [...generated, ...localSeeds.map((seed, index) => makers[index % makers.length](seed, scoped))];
      while (questions.length < count) {
        const seed = seeds[questions.length % seeds.length];
        questions.push(makers[questions.length % makers.length](seed, scoped));
      }
      questions = randomItems(questions, questions.length);
    }
    startQuestions(questions.slice(0, count));
  } catch (error) { showSetupError(`${error.message} Réessaie dans quelques instants.`); }
  finally { setLoading(false); }
}

function startReview(count = 20) {
  const errors = (state.progress.errors || []).filter(item => item?.answers?.length >= 2);
  if (!errors.length) { showSetupError('Aucune erreur à revoir pour le moment. Fais d’abord un quiz.'); return; }
  startQuestions(randomItems(errors, Math.min(count, errors.length)).map(question => ({ ...question, selectedIndex: undefined, type: question.type || 'révision' })));
}

function startQuestions(questions) {
  if (!questions.length) throw new Error('Aucune question disponible.');
  state.questions = questions; state.current = 0; state.score = 0; state.attemptSaved = false; state.currentAttempt = null;
  elements.setup.classList.add('hidden'); elements.dashboard.classList.add('hidden'); elements.help.classList.add('hidden'); elements.result.classList.add('hidden'); elements.quiz.classList.remove('hidden');
  showQuestion();
}

function setLoading(loading) { elements.start.disabled = loading; elements.start.textContent = loading ? 'Création du quiz…' : 'Créer mon quiz'; }
function showSetupError(message) { elements.status.textContent = message; elements.status.className = 'status error'; }
function shuffleQuestion(question) {
  const answers = (question.answers || []).map((text, index) => ({ text, correct: index === Number(question.correctIndex) }));
  const shuffled = randomItems(answers, answers.length);
  return { ...question, answers: shuffled.map(answer => answer.text), correctIndex: shuffled.findIndex(answer => answer.correct) };
}

function showQuestion() {
  clearTimer(); state.answered = false;
  const question = state.questions[state.current]; const total = state.questions.length;
  elements.progress.textContent = `Question ${state.current + 1}/${total}`;
  elements.progressBar.style.width = `${((state.current + 1) / total) * 100}%`;
  elements.score.textContent = `Score : ${state.score}`;
  const labels = { qcm: 'QCM', truefalse: 'VRAI OU FAUX', reference: 'RETROUVER LA RÉFÉRENCE', completion: 'COMPLÉTER LE VERSET', révision: 'RÉVISION' };
  elements.questionType.textContent = labels[question.type] || 'QUESTION';
  elements.question.textContent = question.question; elements.answers.replaceChildren();
  elements.feedback.className = 'feedback hidden'; elements.next.classList.add('hidden'); elements.report.classList.add('hidden');
  question.answers.forEach((answer, index) => {
    const button = document.createElement('button'); button.className = 'answer'; button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    button.addEventListener('click', () => answerQuestion(index)); elements.answers.append(button);
  });
  const seconds = Number(elements.challenge.value);
  if (seconds) startTimer(seconds); else elements.timer.classList.add('hidden');
}

function startTimer(seconds) {
  state.timeLeft = seconds; elements.timer.classList.remove('hidden'); renderTimer();
  state.timerId = setInterval(() => { state.timeLeft -= 1; renderTimer(); if (state.timeLeft <= 0) { clearTimer(); answerQuestion(-1); } }, 1000);
}
function renderTimer() { elements.timer.textContent = `00:${String(Math.max(0, state.timeLeft)).padStart(2, '0')}`; elements.timer.classList.toggle('urgent', state.timeLeft <= 5); }
function clearTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }

function answerQuestion(selectedIndex) {
  if (state.answered) return; state.answered = true; clearTimer();
  const question = state.questions[state.current]; question.selectedIndex = selectedIndex;
  const buttons = [...elements.answers.querySelectorAll('.answer')]; const isCorrect = selectedIndex === Number(question.correctIndex);
  if (isCorrect) { state.score += 1; state.progress.streak = (state.progress.streak || 0) + 1; state.progress.bestStreak = Math.max(state.progress.bestStreak || 0, state.progress.streak); }
  else state.progress.streak = 0;
  buttons.forEach((button, index) => { button.disabled = true; if (index === Number(question.correctIndex)) button.classList.add('correct'); if (index === selectedIndex && !isCorrect) button.classList.add('wrong'); });
  recordProgress(question, isCorrect);
  elements.score.textContent = `Score : ${state.score}`; elements.feedback.replaceChildren();
  const title = document.createElement('strong'); title.textContent = selectedIndex === -1 ? 'Temps écoulé.' : isCorrect ? 'Bonne réponse !' : 'Ce n’est pas la bonne réponse.';
  const explanation = document.createElement('p'); explanation.textContent = question.explanation || '';
  const reference = document.createElement('span'); reference.textContent = question.reference || '';
  elements.feedback.append(title, explanation, reference); elements.feedback.className = `feedback ${isCorrect ? 'success' : 'failure'}`;
  elements.report.classList.remove('hidden'); elements.next.textContent = state.current + 1 === state.questions.length ? 'Voir mon résultat' : 'Question suivante'; elements.next.classList.remove('hidden');
}

function recordProgress(question, isCorrect) {
  const progress = state.progress; progress.answered = (progress.answered || 0) + 1; if (isCorrect) progress.correct = (progress.correct || 0) + 1;
  const book = bookFromReference(question.reference); progress.books[book] ||= { answered: 0, correct: 0 }; progress.books[book].answered += 1; if (isCorrect) progress.books[book].correct += 1;
  const day = todayKey(); progress.days[day] = (progress.days[day] || 0) + 1;
  if (question.reference) { progress.usedReferences ||= []; progress.usedReferences.push(question.reference); progress.usedReferences = progress.usedReferences.slice(-1000); }
  progress.errors ||= []; const key = questionKey(question); const errorIndex = progress.errors.findIndex(item => questionKey(item) === key);
  if (isCorrect && errorIndex >= 0) progress.errors.splice(errorIndex, 1);
  if (!isCorrect) { const clean = { ...question, selectedIndex: undefined }; if (errorIndex >= 0) progress.errors[errorIndex] = clean; else progress.errors.push(clean); progress.errors = progress.errors.slice(-300); }
  saveState();
}

function nextQuestion() { if (state.current + 1 < state.questions.length) { state.current += 1; showQuestion(); elements.quiz.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else showResult(); }
function showResult() {
  clearTimer(); const total = state.questions.length; const percentage = Math.round((state.score / total) * 100);
  elements.quiz.classList.add('hidden'); elements.result.classList.remove('hidden'); elements.finalScore.textContent = `${state.score}/${total}`;
  elements.finalMessage.textContent = percentage >= 80 ? 'Excellent résultat !' : percentage >= 50 ? 'Bien joué, continue comme ça.' : 'Une nouvelle partie te permettra de progresser.';
  const errors = total - state.score; elements.resultStats.innerHTML = `<span>${percentage}% de réussite</span><span>${errors} erreur${errors > 1 ? 's' : ''}</span><span>Série record : ${state.progress.bestStreak || 0}</span>`;
  saveCurrentAttempt(); elements.reviewErrors.disabled = !(state.progress.errors || []).length; elements.result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function saveCurrentAttempt() {
  if (state.attemptSaved) return;
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  state.currentAttempt = { id, date: new Date().toISOString(), scope: elements.scope.value, scopeLabel: selectedScopeLabel(), difficulty: elements.difficulty.value, score: state.score,
    questions: state.questions.map(question => ({ question: question.question, answers: [...question.answers], correctIndex: Number(question.correctIndex), selectedIndex: Number(question.selectedIndex), explanation: question.explanation || '', reference: question.reference || '', type: question.type || 'qcm' })) };
  state.history.push(state.currentAttempt); state.history = dedupeAttempts(state.history); saveState(); state.attemptSaved = true;
}
function dedupeAttempts(attempts) { const merged = new Map(); attempts.forEach(attempt => merged.set(attempt.id || `${attempt.date}-${attempt.questions?.length}`, attempt)); return [...merged.values()].sort((a, b) => new Date(a.date) - new Date(b.date)); }
function mergeHistories(existing, local) { return dedupeAttempts([...existing, ...local]); }
function exportHistory() {
  if (elements.wordContent.value === 'all') return state.history;
  return state.history.map(attempt => ({ ...attempt, questions: (attempt.questions || []).filter(question => Number(question.selectedIndex) !== Number(question.correctIndex)) })).filter(attempt => attempt.questions.length);
}

async function createNewCarnet() {
  await withButton(elements.createWord, 'Création du carnet…', async () => {
    const blob = await QuizWord.createCarnet(exportHistory());
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({ suggestedName: 'Carnet-Quiz-Biblique.docx', types: [{ description: 'Document Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); alert('Le nouveau carnet Word a été créé.');
    } else QuizWord.download(blob, 'Carnet-Quiz-Biblique.docx');
  });
}

async function updateExistingCarnet() {
  await withButton(elements.updateWord, 'Mise à jour du carnet…', async () => {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: 'Carnet Word du quiz biblique', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const existing = await QuizWord.readCarnet(await handle.getFile()); const merged = mergeHistories(existing, exportHistory()); const blob = await QuizWord.createCarnet(merged);
      const permission = await handle.requestPermission({ mode: 'readwrite' }); if (permission !== 'granted') throw new Error('Autorisation d’écriture refusée.');
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); state.history = mergeHistories(state.history, merged); saveState();
      alert(`Carnet mis à jour : ${QuizWord.countUniqueQuestions(merged)} question(s) unique(s) conservée(s).`); return;
    }
    elements.wordFile.click();
  });
}

async function updateFallback(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try { const existing = await QuizWord.readCarnet(file); const merged = mergeHistories(existing, exportHistory()); const blob = await QuizWord.createCarnet(merged); QuizWord.download(blob, 'Carnet-Quiz-Biblique-MIS-A-JOUR.docx'); state.history = mergeHistories(state.history, merged); saveState(); alert('Le carnet actualisé a été téléchargé. Vérifie-le avant de remplacer l’ancien.'); }
  catch (error) { alert(`Mise à jour impossible : ${error.message}`); } finally { event.target.value = ''; }
}
async function withButton(button, loadingText, action) { const text = button.textContent; button.disabled = true; button.textContent = loadingText; try { await action(); } catch (error) { if (error.name !== 'AbortError') alert(`Opération impossible : ${error.message}`); } finally { button.disabled = false; button.textContent = text; } }

function reportQuestion() {
  const question = state.questions[state.current]; state.progress.flagged ||= []; const key = questionKey(question);
  if (!state.progress.flagged.some(item => questionKey(item) === key)) state.progress.flagged.push({ ...question, reportedAt: new Date().toISOString() });
  saveState(); elements.report.textContent = 'Question signalée'; elements.report.disabled = true;
}

function updateDashboard() {
  const p = state.progress; const success = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  elements.statsGrid.innerHTML = [
    ['Questions répondues', p.answered || 0], ['Taux de réussite', `${success}%`], ['Série record', p.bestStreak || 0], ['À revoir', (p.errors || []).length]
  ].map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  const rows = Object.entries(p.books || {}).sort((a, b) => b[1].answered - a[1].answered).slice(0, 12);
  elements.bookProgress.innerHTML = rows.length ? rows.map(([book, data]) => { const rate = Math.round((data.correct / data.answered) * 100); return `<div class="book-row"><span>${book}</span><div class="mini-track"><i style="width:${rate}%"></i></div><strong>${rate}%</strong></div>`; }).join('') : '<p class="hint">Les résultats par livre apparaîtront après le premier quiz.</p>';
  const daily = p.days?.[todayKey()] || 0; elements.dailyGoal.textContent = `${daily}/${DAILY_TARGET} questions aujourd’hui`; elements.dailyBar.style.width = `${Math.min(100, (daily / DAILY_TARGET) * 100)}%`;
  elements.flaggedCount.textContent = `${(p.flagged || []).length} question(s) signalée(s) sur cet appareil.`;
}

function switchPanel(id) {
  clearTimer(); [elements.setup, elements.dashboard, elements.help, elements.quiz, elements.result].forEach(panel => panel.classList.add('hidden'));
  const panel = document.getElementById(id); panel?.classList.remove('hidden'); document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === id));
  if (id === 'dashboard') updateDashboard();
}
function restart() { state.questions = []; state.currentAttempt = null; switchPanel('setup'); elements.status.textContent = `${state.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets prêts`; elements.status.className = 'status ready'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
function updateScopeFields() {
  elements.bookField.classList.toggle('hidden', elements.scope.value !== 'book');
  elements.booksField.classList.toggle('hidden', elements.scope.value !== 'books');
  elements.categoryField.classList.toggle('hidden', elements.scope.value !== 'category');
  elements.searchField.classList.toggle('hidden', elements.scope.value !== 'search');
}

function selectedScopeLabel() {
  if (elements.scope.value === 'book') return elements.book.options[elements.book.selectedIndex]?.text || 'Un livre précis';
  if (elements.scope.value === 'books') return [...elements.books.selectedOptions].map(option => option.text).join(', ') || 'Plusieurs livres';
  if (elements.scope.value === 'category') return elements.category.options[elements.category.selectedIndex]?.text || 'Catégorie biblique';
  if (elements.scope.value === 'search') return `Recherche : ${elements.searchTerm.value.trim()}`;
  return elements.scope.options[elements.scope.selectedIndex].text;
}

function resetProgress() {
  if (!confirm('Réinitialiser les statistiques et les erreurs mémorisées sur cet appareil ? Le carnet Word ne sera pas supprimé.')) return;
  state.progress = { answered: 0, correct: 0, streak: 0, bestStreak: 0, errors: [], usedReferences: [], books: {}, days: {}, flagged: [] }; saveState(); updateDashboard();
}

elements.start.addEventListener('click', () => createQuiz()); elements.next.addEventListener('click', nextQuestion); elements.restart.addEventListener('click', restart);
elements.reviewErrors.addEventListener('click', () => startReview(Number(elements.count.value))); elements.report.addEventListener('click', reportQuestion);
elements.updateWord.addEventListener('click', updateExistingCarnet); elements.createWord.addEventListener('click', createNewCarnet); elements.wordFile.addEventListener('change', updateFallback);
elements.scope.addEventListener('change', updateScopeFields); elements.resetProgress.addEventListener('click', resetProgress);
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));
window.addEventListener('beforeunload', clearTimer);
loadBible();
