const API_URL = globalThis.QUIZ_CONFIG?.apiUrl || 'https://quiz-biblique-api.thomas-clain974.workers.dev';
const DAILY_TARGET = 20;
const DEFAULT_PROGRESS = { answered: 0, correct: 0, streak: 0, bestStreak: 0, errors: [], usedReferences: [], books: {}, days: {}, flagged: [] };
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
  history: QuizData.getHistory(), progress: QuizData.getProgress(DEFAULT_PROGRESS),
  favorites: QuizData.getFavorites(), selectedReaderVerse: 1
};

const $ = selector => document.querySelector(selector);
const elements = {
  setup: $('#setup'), dashboard: $('#dashboard'), bibleReader: $('#bible-reader'), aiSearch: $('#ai-search'), exportCenter: $('#export-center'), help: $('#help'), status: $('#status'),
  scope: $('#scope'), book: $('#book'), books: $('#books'), category: $('#category'), bookField: $('#book-field'), booksField: $('#books-field'), categoryField: $('#category-field'), searchField: $('#search-field'), searchTerm: $('#search-term'), searchHelp: $('#search-help'),
  gameMode: $('#game-mode'), difficulty: $('#difficulty'), count: $('#count'), challenge: $('#challenge'), start: $('#start'),
  quiz: $('#quiz'), progress: $('#progress'), progressBar: $('#progress-bar'), timer: $('#timer'), score: $('#score'), questionType: $('#question-type'),
  question: $('#question'), answers: $('#answers'), feedback: $('#feedback'), report: $('#report'), next: $('#next'),
  result: $('#result'), finalScore: $('#final-score'), finalMessage: $('#final-message'), resultStats: $('#result-stats'), restart: $('#restart'),
  reviewErrors: $('#review-errors'), updateWord: $('#update-word'), createWord: $('#create-word'), wordFile: $('#word-file'), wordContent: $('#word-content'),
  statsGrid: $('#stats-grid'), bookProgress: $('#book-progress'), dailyGoal: $('#daily-goal'), dailyBar: $('#daily-bar'), flaggedCount: $('#flagged-count'), resetProgress: $('#reset-progress'),
  favoriteTotal: $('#favorite-total'), recentAttempts: $('#recent-attempts'), dashboardMessage: $('#dashboard-message'),
  readerBook: $('#reader-book'), readerChapter: $('#reader-chapter'), readerVerse: $('#reader-verse'), readerReference: $('#reader-reference'), chapterText: $('#chapter-text'), previousChapter: $('#previous-chapter'), nextChapter: $('#next-chapter'), favoriteVerse: $('#favorite-verse'), favoritesList: $('#favorites-list'),
  bibleQuery: $('#bible-query'), localSearch: $('#local-search'), smartSearch: $('#smart-search'), searchStatus: $('#search-status'), searchResults: $('#search-results'), assistantThread: $('#assistant-thread'),
  accountButton: $('#account-button'), accountLabel: $('#account-label'), accountModal: $('#account-modal'), accountGuest: $('#account-guest'), accountUser: $('#account-user'), authForm: $('#auth-form'), authStatus: $('#auth-status'), authSubmit: $('#auth-submit'), displayNameField: $('#display-name-field'), displayName: $('#display-name'), authEmail: $('#auth-email'), authPassword: $('#auth-password'), cloudSetupHint: $('#cloud-setup-hint'), profileAvatar: $('#profile-avatar'), profileName: $('#profile-name'), profileEmail: $('#profile-email'), syncState: $('#sync-state'), syncNow: $('#sync-now'), signOut: $('#sign-out'), forgotPassword: $('#forgot-password'), passwordResetRequest: $('#password-reset-request'), passwordResetForm: $('#password-reset-form'), resetEmail: $('#reset-email'), resetStatus: $('#reset-status'), cancelPasswordReset: $('#cancel-password-reset'), passwordUpdate: $('#password-update'), passwordUpdateForm: $('#password-update-form'), newPassword: $('#new-password'), confirmNewPassword: $('#confirm-new-password'), passwordUpdateStatus: $('#password-update-status'),
  exportMode: $('#export-mode'), exportResult: $('#export-result'), exportPeriod: $('#export-period'), exportBook: $('#export-book'), exportPreview: $('#export-preview'), exportNewWord: $('#export-new-word'), exportUpdateWord: $('#export-update-word'), exportWordFile: $('#export-word-file'), exportHistory: $('#export-history')
};

function saveState() { QuizData.saveHistory(state.history); QuizData.saveProgress(state.progress); QuizData.saveFavorites(state.favorites); }
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
    elements.readerBook.replaceChildren(...bible.books.map((book, index) => new Option(book.name, String(index))));
    elements.exportBook.append(...bible.books.map(book => new Option(book.name, book.name)));
    elements.category.replaceChildren(...BIBLE_CATEGORIES.map(category => new Option(category.label, category.id)));
    elements.status.textContent = `${bible.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets prêts`;
    elements.status.className = 'status ready';
    [elements.scope, elements.gameMode, elements.difficulty, elements.count, elements.challenge, elements.start].forEach(element => { element.disabled = false; });
    updateReaderControls();
    renderChapter();
    updateDashboard();
    updateExportCenter();
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
  [elements.setup, elements.dashboard, elements.bibleReader, elements.aiSearch, elements.exportCenter, elements.help, elements.result].forEach(panel => panel.classList.add('hidden'));
  elements.quiz.classList.remove('hidden');
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
  elements.favoriteTotal.textContent = state.favorites.length;
  elements.favoriteTotal.nextElementSibling.textContent = `passage${state.favorites.length > 1 ? 's' : ''} favori${state.favorites.length > 1 ? 's' : ''}`;
  elements.dashboardMessage.textContent = daily >= DAILY_TARGET ? 'Objectif quotidien atteint. Bravo !' : daily ? `Encore ${DAILY_TARGET - daily} question(s) pour atteindre ton objectif.` : 'Commence un quiz ou poursuis ta lecture.';
  const recent = [...state.history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  elements.recentAttempts.innerHTML = recent.length ? recent.map(attempt => {
    const total = attempt.questions?.length || 0;
    return `<div class="recent-item"><div><strong>${escapeHtml(attempt.scopeLabel || 'Quiz biblique')}</strong><small>${formatDate(attempt.date)}</small></div><span>${attempt.score ?? 0}/${total}</span></div>`;
  }).join('') : '<p class="hint">Aucun quiz terminé pour le moment.</p>';
}

function switchPanel(id) {
  clearTimer(); [elements.setup, elements.dashboard, elements.bibleReader, elements.aiSearch, elements.exportCenter, elements.help, elements.quiz, elements.result].forEach(panel => panel.classList.add('hidden'));
  const panel = document.getElementById(id); panel?.classList.remove('hidden'); document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === id));
  if (id === 'dashboard') updateDashboard();
  if (id === 'bible-reader') { renderChapter(); renderFavorites(); }
  if (id === 'export-center') updateExportCenter();
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

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function updateReaderControls(keepChapter = false) {
  const book = state.books[Number(elements.readerBook.value) || 0];
  if (!book) return;
  const previousChapter = keepChapter ? Number(elements.readerChapter.value) : 0;
  elements.readerChapter.replaceChildren(...book.chapters.map((chapter, index) => new Option(String(chapter.number), String(index))));
  elements.readerChapter.value = String(Math.min(previousChapter, book.chapters.length - 1));
  updateVerseOptions();
}

function updateVerseOptions() {
  const book = state.books[Number(elements.readerBook.value) || 0];
  const chapter = book?.chapters[Number(elements.readerChapter.value) || 0];
  if (!chapter) return;
  elements.readerVerse.replaceChildren(...chapter.verses.map((verse, index) => new Option(String(verse.number), String(index))));
  state.selectedReaderVerse = Math.min(state.selectedReaderVerse || 1, chapter.verses.length);
  elements.readerVerse.value = String(state.selectedReaderVerse - 1);
}

function currentReaderVerse() {
  const bookIndex = Number(elements.readerBook.value) || 0;
  const chapterIndex = Number(elements.readerChapter.value) || 0;
  const verseIndex = Number(elements.readerVerse.value) || 0;
  const book = state.books[bookIndex];
  const chapter = book?.chapters[chapterIndex];
  const verse = chapter?.verses[verseIndex];
  return verse ? { bookIndex, chapterIndex, verseIndex, book: book.name, chapter: chapter.number, verse: verse.number, text: verse.text.trim(), reference: `${book.name} ${chapter.number}:${verse.number}` } : null;
}

function renderChapter() {
  const bookIndex = Number(elements.readerBook.value) || 0;
  const chapterIndex = Number(elements.readerChapter.value) || 0;
  const book = state.books[bookIndex];
  const chapter = book?.chapters[chapterIndex];
  if (!chapter) return;
  elements.readerReference.textContent = `${book.name} ${chapter.number}`;
  elements.chapterText.innerHTML = chapter.verses.map((verse, index) => `<span class="verse${index === Number(elements.readerVerse.value) ? ' selected' : ''}" data-verse="${index}"><sup class="verse-number">${verse.number}</sup>${escapeHtml(verse.text.trim())} </span>`).join('');
  elements.previousChapter.disabled = bookIndex === 0 && chapterIndex === 0;
  elements.nextChapter.disabled = bookIndex === state.books.length - 1 && chapterIndex === book.chapters.length - 1;
  updateFavoriteButton();
}

function selectReaderVerse(index, scroll = true) {
  state.selectedReaderVerse = Number(index) + 1;
  elements.readerVerse.value = String(index);
  renderChapter();
  if (scroll) elements.chapterText.querySelector(`[data-verse="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function moveChapter(direction) {
  let bookIndex = Number(elements.readerBook.value) || 0;
  let chapterIndex = Number(elements.readerChapter.value) || 0;
  chapterIndex += direction;
  if (chapterIndex < 0 && bookIndex > 0) { bookIndex -= 1; chapterIndex = state.books[bookIndex].chapters.length - 1; }
  if (chapterIndex >= state.books[bookIndex].chapters.length && bookIndex < state.books.length - 1) { bookIndex += 1; chapterIndex = 0; }
  elements.readerBook.value = String(bookIndex); updateReaderControls(); elements.readerChapter.value = String(chapterIndex); state.selectedReaderVerse = 1; updateVerseOptions(); renderChapter();
}

function toggleFavorite() {
  const verse = currentReaderVerse();
  if (!verse) return;
  const existing = state.favorites.findIndex(item => item.reference === verse.reference);
  if (existing >= 0) state.favorites.splice(existing, 1); else state.favorites.push({ reference: verse.reference, book: verse.book, chapter: verse.chapter, verse: verse.verse, text: verse.text, savedAt: new Date().toISOString() });
  saveState(); updateFavoriteButton(); renderFavorites(); updateDashboard();
}

function updateFavoriteButton() {
  const verse = currentReaderVerse();
  const saved = verse && state.favorites.some(item => item.reference === verse.reference);
  elements.favoriteVerse.textContent = saved ? '★ Retirer des favoris' : '☆ Ajouter aux favoris';
}

function renderFavorites() {
  elements.favoritesList.innerHTML = state.favorites.length ? [...state.favorites].reverse().map(item => `<div class="favorite-item"><strong>${escapeHtml(item.reference)}</strong><p>${escapeHtml(item.text)}</p><button class="secondary open-reference" data-reference="${escapeHtml(item.reference)}" type="button">Ouvrir</button><button class="secondary remove-favorite" data-reference="${escapeHtml(item.reference)}" type="button">Retirer</button></div>`).join('') : '<p class="hint">Sélectionne un verset puis ajoute-le à tes favoris.</p>';
}

function openReference(reference) {
  const verse = state.verses.find(item => `${item.book} ${item.chapter}:${item.verse}` === reference);
  if (!verse) return;
  elements.readerBook.value = String(verse.bookIndex); updateReaderControls(); elements.readerChapter.value = String(verse.chapterIndex); updateVerseOptions(); elements.readerVerse.value = String(verse.verseIndex); state.selectedReaderVerse = verse.verseIndex + 1; switchPanel('bible-reader'); renderChapter();
  setTimeout(() => elements.chapterText.querySelector(`[data-verse="${verse.verseIndex}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
}

const SEARCH_STOP_WORDS = new Set('dans avec pour une les des que qui est sont passage verset bible trouve trouver parle moi cette celui cette comment lorsque'.split(' '));
const SEARCH_ALIASES = { tempete: ['vent', 'mer', 'barque'], peur: ['crains', 'crainte'], amour: ['charite', 'aime'], pardon: ['pardonne', 'peche'], esprit: ['saint-esprit', 'esprit'], resurrection: ['ressuscite', 'ressuscita'] };

function findRelevantVerses(rawQuery, contextual = false, limit = 25) {
  const query = normalize(rawQuery.trim());
  if (query.length < 2) return [];
  const originalTerms = query.split(/[^a-z0-9à-ÿœ'-]+/).filter(term => term.length > 2 && !SEARCH_STOP_WORDS.has(term));
  const terms = new Set(originalTerms);
  if (contextual) originalTerms.forEach(term => (SEARCH_ALIASES[term] || []).forEach(alias => terms.add(alias)));
  return state.verses.map(verse => {
    const text = normalize(verse.text); let score = text.includes(query) ? 20 : 0;
    terms.forEach(term => { if (text.includes(term)) score += originalTerms.includes(term) ? 4 : 1; });
    return { ...verse, score, reference: `${verse.book} ${verse.chapter}:${verse.verse}` };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchBible(contextual = false) {
  const query = elements.bibleQuery.value.trim();
  if (query.length < 2) { elements.searchStatus.textContent = 'Saisis au moins deux caractères.'; return; }
  const scored = findRelevantVerses(query, contextual);
  elements.searchStatus.textContent = contextual ? `${scored.length} résultat(s) contextuel(s). La connexion Gemini affinera cette recherche.` : `${scored.length} résultat(s) trouvé(s) dans le texte exact.`;
  renderSearchResults(scored);
}

function appendAssistantMessage(role, text, references = []) {
  const message = document.createElement('div');
  message.className = `assistant-message ${role}`;
  const title = document.createElement('strong'); title.textContent = role === 'user' ? 'Toi' : 'Assistant biblique';
  const paragraph = document.createElement('p'); paragraph.textContent = text;
  message.append(title, paragraph);
  if (references.length) {
    const links = document.createElement('div'); links.className = 'assistant-references';
    references.forEach(reference => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary open-reference'; button.dataset.reference = reference; button.textContent = reference; links.append(button);
    });
    message.append(links);
  }
  elements.assistantThread.append(message); elements.assistantThread.scrollTop = elements.assistantThread.scrollHeight;
}

async function askBibleAssistant() {
  const query = elements.bibleQuery.value.trim();
  if (query.length < 3) { elements.searchStatus.textContent = 'Écris une question un peu plus précise.'; return; }
  const context = findRelevantVerses(query, true, 10);
  appendAssistantMessage('user', query); elements.bibleQuery.value = '';
  elements.smartSearch.disabled = true; elements.smartSearch.textContent = 'Recherche en cours…';
  elements.searchStatus.textContent = 'L’assistant analyse les passages les plus proches de ta demande…';
  try {
    const response = await fetch(`${API_URL}/assistant`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, passages: context.map(item => ({ reference: item.reference, text: item.text })) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.answer) throw new Error(data.error || 'Service Assistant indisponible');
    const references = Array.isArray(data.references) ? data.references.filter(reference => state.verses.some(item => `${item.book} ${item.chapter}:${item.verse}` === reference)) : [];
    appendAssistantMessage('assistant', data.answer, references);
    elements.searchStatus.textContent = 'Réponse générée à partir des passages bibliques proposés. Vérifie toujours les références dans le lecteur.';
    renderSearchResults(context.slice(0, 8));
  } catch {
    const message = context.length
      ? 'Le service IA n’est pas encore activé, mais voici les passages les plus proches de ta demande. Tu peux les ouvrir pour poursuivre ton étude.'
      : 'Le service IA n’est pas encore activé et aucun passage suffisamment proche n’a été trouvé. Essaie avec des mots plus précis.';
    appendAssistantMessage('assistant', message, context.slice(0, 4).map(item => item.reference));
    elements.searchStatus.textContent = 'Mode de secours local utilisé : aucune donnée ni clé secrète n’est exposée.';
    renderSearchResults(context);
  } finally {
    elements.smartSearch.disabled = false; elements.smartSearch.textContent = 'Demander à l’assistant';
  }
}

function renderSearchResults(results) {
  elements.searchResults.innerHTML = results.length ? results.map(item => `<div class="search-result"><strong>${escapeHtml(item.reference)}</strong><p>${escapeHtml(item.text)}</p><button class="open-reference" data-reference="${escapeHtml(item.reference)}" type="button">Lire le chapitre</button><button class="secondary save-search-result" data-reference="${escapeHtml(item.reference)}" type="button">Ajouter aux favoris</button></div>`).join('') : '<p class="hint">Aucun résultat. Essaie avec moins de mots ou une formulation différente.</p>';
}

function saveSearchFavorite(reference) {
  const verse = state.verses.find(item => `${item.book} ${item.chapter}:${item.verse}` === reference);
  if (!verse || state.favorites.some(item => item.reference === reference)) return;
  state.favorites.push({ reference, book: verse.book, chapter: verse.chapter, verse: verse.verse, text: verse.text, savedAt: new Date().toISOString() }); saveState(); updateDashboard();
}

function filteredExportHistory() {
  const now = new Date();
  const mode = elements.exportMode.value; const result = elements.exportResult.value; const period = elements.exportPeriod.value; const book = elements.exportBook.value;
  return state.history.filter(attempt => {
    if (period === 'all') return true;
    const date = new Date(attempt.date); const days = period === 'today' ? 1 : Number(period);
    return now - date <= days * 86400000 && (period !== 'today' || date.toDateString() === now.toDateString());
  }).map(attempt => {
    const questions = (attempt.questions || []).filter(question => {
      const isCorrect = Number(question.selectedIndex) === Number(question.correctIndex);
      return (mode === 'all' || (question.type || 'qcm') === mode)
        && (result === 'all' || (result === 'correct' ? isCorrect : !isCorrect))
        && (book === 'all' || bookFromReference(question.reference) === book);
    });
    return { ...attempt, questions, score: questions.filter(question => Number(question.selectedIndex) === Number(question.correctIndex)).length };
  }).filter(attempt => attempt.questions.length);
}

function updateExportCenter() {
  const history = filteredExportHistory(); const questions = history.flatMap(attempt => attempt.questions || []);
  elements.exportPreview.textContent = `${questions.length} question${questions.length > 1 ? 's' : ''} issue${questions.length > 1 ? 's' : ''} de ${history.length} tentative${history.length > 1 ? 's' : ''} sera${questions.length > 1 ? 'ont' : ''} incluse${questions.length > 1 ? 's' : ''}.`;
  elements.exportNewWord.disabled = !questions.length; elements.exportUpdateWord.disabled = !questions.length;
  elements.exportHistory.innerHTML = state.history.length ? [...state.history].reverse().slice(0, 12).map(attempt => `<div class="recent-item"><div><strong>${escapeHtml(attempt.scopeLabel || 'Quiz')}</strong><small>${formatDate(attempt.date)}</small></div><span>${attempt.score ?? 0}/${attempt.questions?.length || 0}</span></div>`).join('') : '<p class="hint">Aucune tentative enregistrée.</p>';
}

async function createFilteredCarnet() {
  await withButton(elements.exportNewWord, 'Création du carnet…', async () => {
    const history = filteredExportHistory(); const blob = await QuizWord.createCarnet(history);
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({ suggestedName: 'Carnet-Quiz-Biblique-Filtre.docx', types: [{ description: 'Document Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close();
    } else QuizWord.download(blob, 'Carnet-Quiz-Biblique-Filtre.docx');
  });
}

async function updateFilteredCarnet() {
  await withButton(elements.exportUpdateWord, 'Mise à jour…', async () => {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: 'Carnet Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const existing = await QuizWord.readCarnet(await handle.getFile()); const merged = mergeHistories(existing, filteredExportHistory()); const blob = await QuizWord.createCarnet(merged);
      const permission = await handle.requestPermission({ mode: 'readwrite' }); if (permission !== 'granted') throw new Error('Autorisation d’écriture refusée.');
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); return;
    }
    elements.exportWordFile.click();
  });
}

async function updateFilteredFallback(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try { const existing = await QuizWord.readCarnet(file); const merged = mergeHistories(existing, filteredExportHistory()); QuizWord.download(await QuizWord.createCarnet(merged), 'Carnet-Quiz-Biblique-MIS-A-JOUR.docx'); }
  catch (error) { alert(`Mise à jour impossible : ${error.message}`); } finally { event.target.value = ''; }
}

function resetProgress() {
  if (!confirm('Réinitialiser les statistiques et les erreurs mémorisées sur cet appareil ? Le carnet Word ne sera pas supprimé.')) return;
  state.progress = { ...DEFAULT_PROGRESS, errors: [], usedReferences: [], books: {}, days: {}, flagged: [] }; saveState(); updateDashboard();
}

let authMode = 'signin';
let accountView = 'auto';
function openAccount() { accountView = 'auto'; elements.accountModal.classList.remove('hidden'); updateAccountUI(); }
function closeAccount() { elements.accountModal.classList.add('hidden'); }
function setAuthStatus(message, kind = '') {
  elements.authStatus.textContent = message;
  elements.authStatus.className = message ? `status ${kind}` : 'status hidden';
}
function userDisplayName(user) { return user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Utilisateur'; }

function setAccountView(view) {
  accountView = view;
  const user = QuizData.user;
  elements.accountGuest.classList.toggle('hidden', view !== 'guest');
  elements.accountUser.classList.toggle('hidden', view !== 'user');
  elements.passwordResetRequest.classList.toggle('hidden', view !== 'reset');
  elements.passwordUpdate.classList.toggle('hidden', view !== 'update');
  if (view === 'auto') setAccountView(user ? 'user' : 'guest');
}

function updateAccountUI() {
  const user = QuizData.user;
  const configured = QuizData.configured;
  if (accountView === 'auto' || accountView === 'guest' || accountView === 'user') setAccountView(user ? 'user' : 'guest');
  elements.cloudSetupHint.classList.toggle('hidden', configured);
  elements.authSubmit.disabled = !configured;
  if (user) {
    const name = userDisplayName(user);
    elements.accountLabel.textContent = name;
    elements.accountButton.classList.add('connected');
    elements.profileName.textContent = name; elements.profileEmail.textContent = user.email || '';
    elements.profileAvatar.textContent = name.slice(0, 1).toUpperCase(); elements.syncState.textContent = 'Compte connecté — synchronisation automatique active';
  } else {
    elements.accountLabel.textContent = configured ? 'Se connecter' : 'Mode local';
    elements.accountButton.classList.remove('connected');
  }
}

function selectAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(button => button.classList.toggle('active', button.dataset.authMode === mode));
  elements.displayNameField.classList.toggle('hidden', mode !== 'signup');
  elements.authSubmit.textContent = mode === 'signup' ? 'Créer mon compte' : 'Se connecter';
  elements.authPassword.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  setAuthStatus('');
}

async function submitAuth(event) {
  event.preventDefault();
  const email = elements.authEmail.value.trim(); const password = elements.authPassword.value;
  elements.authSubmit.disabled = true; elements.authSubmit.textContent = authMode === 'signup' ? 'Création…' : 'Connexion…';
  try {
    if (authMode === 'signup') {
      const data = await QuizData.signUp(email, password, elements.displayName.value.trim());
      setAuthStatus(data.session ? 'Compte créé et connecté.' : 'Compte créé. Consulte ta messagerie pour confirmer ton adresse.', 'ready');
    } else {
      await QuizData.signIn(email, password); setAuthStatus('Connexion réussie. Synchronisation en cours…', 'ready');
    }
    updateAccountUI();
  } catch (error) { setAuthStatus(error.message || 'Connexion impossible.', 'error'); }
  finally { elements.authSubmit.disabled = !QuizData.configured; elements.authSubmit.textContent = authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'; }
}

async function requestPasswordReset(event) {
  event.preventDefault();
  const email = elements.resetEmail.value.trim(); const button = elements.passwordResetForm.querySelector('button[type="submit"]');
  await withButton(button, 'Envoi en cours…', async () => {
    try {
      await QuizData.requestPasswordReset(email);
      elements.resetStatus.textContent = 'Si cette adresse correspond à un compte autorisé, un lien vient d’être envoyé. Pense à vérifier les courriers indésirables.';
      elements.resetStatus.className = 'status ready';
    } catch (error) {
      elements.resetStatus.textContent = error.message || 'Envoi impossible.'; elements.resetStatus.className = 'status error';
    }
  });
}

async function updateRecoveredPassword(event) {
  event.preventDefault();
  if (elements.newPassword.value !== elements.confirmNewPassword.value) {
    elements.passwordUpdateStatus.textContent = 'Les deux mots de passe ne correspondent pas.'; elements.passwordUpdateStatus.className = 'status error'; return;
  }
  const button = elements.passwordUpdateForm.querySelector('button[type="submit"]');
  await withButton(button, 'Enregistrement…', async () => {
    try {
      await QuizData.updatePassword(elements.newPassword.value);
      elements.passwordUpdateStatus.textContent = 'Mot de passe modifié. Tu peux désormais utiliser le nouveau mot de passe.'; elements.passwordUpdateStatus.className = 'status ready';
      history.replaceState({}, '', `${location.pathname}${location.hash}`);
      setTimeout(() => { setAccountView('user'); updateAccountUI(); }, 900);
    } catch (error) {
      elements.passwordUpdateStatus.textContent = error.message || 'Modification impossible.'; elements.passwordUpdateStatus.className = 'status error';
    }
  });
}

async function initializePersonalSpace() {
  updateAccountUI();
  try { await QuizData.initialize?.(); updateAccountUI(); }
  catch (error) { console.warn('Initialisation Supabase impossible', error); }
}

elements.start.addEventListener('click', () => createQuiz()); elements.next.addEventListener('click', nextQuestion); elements.restart.addEventListener('click', restart);
elements.reviewErrors.addEventListener('click', () => startReview(Number(elements.count.value))); elements.report.addEventListener('click', reportQuestion);
elements.updateWord.addEventListener('click', updateExistingCarnet); elements.createWord.addEventListener('click', createNewCarnet); elements.wordFile.addEventListener('change', updateFallback);
elements.scope.addEventListener('change', updateScopeFields); elements.resetProgress.addEventListener('click', resetProgress);
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));
document.querySelectorAll('.quick-nav').forEach(button => button.addEventListener('click', () => switchPanel(button.dataset.target)));
elements.readerBook.addEventListener('change', () => { state.selectedReaderVerse = 1; updateReaderControls(); renderChapter(); });
elements.readerChapter.addEventListener('change', () => { state.selectedReaderVerse = 1; updateVerseOptions(); renderChapter(); });
elements.readerVerse.addEventListener('change', () => selectReaderVerse(elements.readerVerse.value));
elements.chapterText.addEventListener('click', event => { const verse = event.target.closest('.verse'); if (verse) selectReaderVerse(verse.dataset.verse, false); });
elements.previousChapter.addEventListener('click', () => moveChapter(-1)); elements.nextChapter.addEventListener('click', () => moveChapter(1)); elements.favoriteVerse.addEventListener('click', toggleFavorite);
elements.favoritesList.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.classList.contains('open-reference')) openReference(button.dataset.reference); if (button.classList.contains('remove-favorite')) { state.favorites = state.favorites.filter(item => item.reference !== button.dataset.reference); saveState(); renderFavorites(); updateDashboard(); } });
elements.localSearch.addEventListener('click', () => searchBible(false)); elements.smartSearch.addEventListener('click', askBibleAssistant);
elements.bibleQuery.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askBibleAssistant(); } });
document.querySelectorAll('.suggestion').forEach(button => button.addEventListener('click', () => { elements.bibleQuery.value = button.textContent; askBibleAssistant(); }));
elements.assistantThread.addEventListener('click', event => { const button = event.target.closest('.open-reference'); if (button) openReference(button.dataset.reference); });
elements.searchResults.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.classList.contains('open-reference')) openReference(button.dataset.reference); if (button.classList.contains('save-search-result')) { saveSearchFavorite(button.dataset.reference); button.textContent = 'Ajouté'; button.disabled = true; } });
[elements.exportMode, elements.exportResult, elements.exportPeriod, elements.exportBook].forEach(select => select.addEventListener('change', updateExportCenter));
elements.exportNewWord.addEventListener('click', createFilteredCarnet); elements.exportUpdateWord.addEventListener('click', updateFilteredCarnet); elements.exportWordFile.addEventListener('change', updateFilteredFallback);
window.addEventListener('beforeunload', clearTimer);
elements.accountButton.addEventListener('click', openAccount); document.querySelectorAll('[data-close-account]').forEach(button => button.addEventListener('click', closeAccount));
document.querySelectorAll('.auth-tab').forEach(button => button.addEventListener('click', () => selectAuthMode(button.dataset.authMode)));
elements.authForm.addEventListener('submit', submitAuth);
elements.forgotPassword.addEventListener('click', () => { elements.resetEmail.value = elements.authEmail.value; setAccountView('reset'); });
elements.cancelPasswordReset.addEventListener('click', () => setAccountView('guest'));
elements.passwordResetForm.addEventListener('submit', requestPasswordReset);
elements.passwordUpdateForm.addEventListener('submit', updateRecoveredPassword);
elements.signOut.addEventListener('click', async () => { await QuizData.signOut(); updateAccountUI(); });
elements.syncNow.addEventListener('click', async () => { await withButton(elements.syncNow, 'Synchronisation…', () => QuizData.syncNow()); elements.syncState.textContent = 'Données synchronisées à l’instant'; });
window.addEventListener('quizdata:auth-changed', event => {
  if (event.detail?.event === 'PASSWORD_RECOVERY') { elements.accountModal.classList.remove('hidden'); setAccountView('update'); }
  else updateAccountUI();
});
window.addEventListener('quizdata:remote-loaded', () => { state.history = QuizData.getHistory(); state.progress = QuizData.getProgress(DEFAULT_PROGRESS); state.favorites = QuizData.getFavorites(); updateDashboard(); renderFavorites(); updateExportCenter(); });
window.addEventListener('quizdata:synced', () => { elements.syncState.textContent = 'Données synchronisées'; });
window.addEventListener('quizdata:sync-error', () => { elements.syncState.textContent = 'Synchronisation différée — les données restent enregistrées localement'; });
initializePersonalSpace();
loadBible();
