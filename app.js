const API_URL = globalThis.QUIZ_CONFIG?.apiUrl || 'https://quiz-biblique-api.thomas-clain974.workers.dev';
const DEFAULT_GOALS = { dailyQuestions: 20, weeklyDays: 4 };
const DEFAULT_STUDY = { duration: 0, startDate: '', completed: [], notes: {}, deepDive: [], lastReference: '', updatedAt: '' };
const DEFAULT_PROGRESS = { answered: 0, correct: 0, streak: 0, bestStreak: 0, errors: [], usedReferences: [], books: {}, days: {}, flagged: [], goals: { ...DEFAULT_GOALS }, study: { ...DEFAULT_STUDY } };
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

const CORPORA = {
  bible: {
    id: 'bible', domain: 'religion', kind: 'sacred', title: 'Quiz biblique', shortName: 'Bible', edition: 'LOUIS SEGOND 1910', source: 'Bible Louis Segond 1910 — domaine public.',
    subtitle: 'Lis, recherche et progresse à ton rythme.', file: 'bible.json', bookLimit: null,
    itemName: 'livre', itemNamePlural: 'livres', verseName: 'verset', readerTitle: 'Lire la Bible', assistantName: 'Assistant biblique',
    categories: BIBLE_CATEGORIES,
    famous: ['Genèse 1:1','Psaumes 23:1','Psaumes 119:105','Proverbes 3:5','Ésaïe 9:5','Ésaïe 40:31','Jérémie 29:11','Jean 3:16','Jean 14:6','Romains 8:28','Romains 12:2','1 Corinthiens 13:4','Philippiens 4:13','Hébreux 11:1']
  },
  torah: {
    id: 'torah', domain: 'religion', kind: 'sacred', title: 'Étude de la Torah', shortName: 'Torah', edition: 'TORAH — CINQ LIVRES', source: 'Pentateuque, texte français Louis Segond 1910 — domaine public.',
    subtitle: 'Étudie les cinq livres de la Torah et mesure ta progression.', file: 'bible.json', bookLimit: 5,
    itemName: 'livre', itemNamePlural: 'livres', verseName: 'verset', readerTitle: 'Lire la Torah', assistantName: 'Assistant Torah',
    categories: [{ id: 'torah-books', label: 'Les cinq livres de la Torah', start: 0, end: 4 }],
    famous: ['Genèse 1:1','Genèse 12:1','Exode 3:14','Exode 20:12','Lévitique 19:18','Nombres 6:24','Deutéronome 6:4']
  },
  coran: {
    id: 'coran', domain: 'religion', kind: 'sacred', title: 'Étude du Coran', shortName: 'Coran', edition: 'CORAN — ARABE & FRANÇAIS', source: 'Arabe et traduction française : quran-json 3.1.2, licence CC BY-SA 4.0.',
    subtitle: 'Lis les sourates, interroge le texte et progresse à ton rythme.', files: ['quran-1.json', 'quran-2.json', 'quran-3.json', 'quran-4.json', 'quran-5.json', 'quran-6.json'], bookLimit: null,
    itemName: 'sourate', itemNamePlural: 'sourates', verseName: 'verset', readerTitle: 'Lire le Coran', assistantName: 'Assistant coranique',
    categories: [{ id: 'meccan', label: 'Sourates mecquoises', category: 'meccan' }, { id: 'medinan', label: 'Sourates médinoises', category: 'medinan' }],
    famous: ['Al-Fatihah 1:1','Al-Baqarah 2:255','Al-Ikhlas 112:1','Al-Falaq 113:1','An-Nas 114:1']
  },
  histoire: {
    id: 'histoire', domain: 'humanities', kind: 'history', title: 'Histoire de France', shortName: 'Histoire de France', edition: 'DES ORIGINES À NOS JOURS',
    source: 'Fiches de synthèse rédigées à partir de ressources institutionnelles : Assemblée nationale, Élysée et Chemins de mémoire.',
    subtitle: 'Explore les grandes périodes, les dates et les événements qui ont façonné la France.', file: 'history-france.json', bookLimit: null,
    itemName: 'période', itemNamePlural: 'périodes', verseName: 'événement', chapterName: 'dossier', readerTitle: 'Explorer l’histoire de France', assistantName: 'Assistant historique',
    categories: [
      { id: 'origines', label: 'Des origines au Moyen Âge', start: 0, end: 1 },
      { id: 'monarchie', label: 'Renaissance et monarchie', start: 2, end: 3 },
      { id: 'revolutions', label: 'Révolutions et XIXe siècle', start: 4, end: 7 },
      { id: 'guerres', label: 'Guerres mondiales et reconstruction', start: 8, end: 9 },
      { id: 'contemporain', label: 'Cinquième République et époque contemporaine', start: 10, end: 11 }
    ],
    famous: ['Gaule et Antiquité 1:7','Moyen Âge 1:2','Moyen Âge 1:4','Guerre de Cent Ans et Renaissance 1:3','Révolution française 1:2','Révolution française 1:4','Consulat et Premier Empire 1:3','Troisième République 1:5','Seconde Guerre mondiale 1:2','Seconde Guerre mondiale 1:6','Cinquième République 1:1','Cinquième République 1:6']
  },
  'histoire-reunion': humanitiesConfig('histoire-reunion', 'history', 'Histoire de La Réunion', 'HISTOIRE DE LA RÉUNION', 'Explore le peuplement, l’abolition, la départementalisation et les transformations de l’île.', '☀'),
  'histoire-monde': humanitiesConfig('histoire-monde', 'history', 'Histoire du monde', 'DES PREMIÈRES CIVILISATIONS AU XXe SIÈCLE', 'Parcours les civilisations, les empires, les échanges et les grandes ruptures mondiales.', '⌛'),
  'geographie-france': humanitiesConfig('geographie-france', 'geography', 'Géographie de la France', 'TERRITOIRES, RELIEFS ET POPULATIONS', 'Découvre les territoires, les paysages, les climats et les activités de la France.', '⬡'),
  'geographie-reunion': humanitiesConfig('geographie-reunion', 'geography', 'Géographie de La Réunion', 'ÎLE, VOLCANS, CIRQUES ET COMMUNES', 'Explore les reliefs, les communes, les climats et les milieux naturels réunionnais.', '◉'),
  'geographie-monde': humanitiesConfig('geographie-monde', 'geography', 'Géographie du monde', 'CONTINENTS, OCÉANS ET SOCIÉTÉS', 'Comprends les grands ensembles physiques et humains de la planète.', '◎'),
  'reperes-monde': humanitiesConfig('reperes-monde', 'geography', 'Repères du monde', 'CAPITALES, DRAPEAUX ET GÉOPOLITIQUE', 'Mémorise les capitales, les symboles, les organisations et les grands repères géopolitiques.', '⚑')
};

function humanitiesConfig(id, kind, title, edition, subtitle) {
  const historical = kind === 'history';
  return {
    id, domain: 'humanities', kind, title, shortName: title, edition, subtitle,
    file: 'humanities.json', datasetKey: id, bookLimit: null,
    source: 'Fiches pédagogiques synthétiques reliées à des ressources publiques et institutionnelles.',
    itemName: historical ? 'période' : 'rubrique', itemNamePlural: historical ? 'périodes' : 'rubriques',
    verseName: historical ? 'événement' : 'repère', chapterName: 'dossier',
    readerTitle: historical ? `Explorer ${title.toLowerCase()}` : `Découvrir ${title.toLowerCase()}`,
    assistantName: historical ? 'Assistant historique' : 'Assistant géographique', categories: [], famous: []
  };
}

const state = {
  corpus: QuizData.getCorpus?.() || 'bible',
  books: [], verses: [], questions: [], current: 0, score: 0, answered: false,
  attemptSaved: false, currentAttempt: null, timerId: null, timeLeft: 0,
  history: QuizData.getHistory(), progress: QuizData.getProgress(DEFAULT_PROGRESS),
  favorites: QuizData.getFavorites(), selectedReaderVerse: 1
};

const $ = selector => document.querySelector(selector);
const elements = {
  appTitle: $('#app-title'), appSubtitle: $('#app-subtitle'), corpusEdition: $('#corpus-edition'), readerTab: $('#reader-tab'), readerTabLabel: $('#reader-tab-label'), scopeLabel: $('#scope-label'), bookLabel: $('#book-label'), booksLabel: $('#books-label'), categoryLabel: $('#category-label'), welcomeTitle: $('#welcome-title'), openReaderLabel: $('#open-reader-label'), readerEyebrow: $('#reader-eyebrow'), readerTitle: $('#reader-title'), readerBookLabel: $('#reader-book-label'), readerChapterLabel: $('#reader-chapter-label'), readerVerseLabel: $('#reader-verse-label'), readerChapterField: $('#reader-chapter-field'), previousChapter: $('#previous-chapter'), nextChapter: $('#next-chapter'), sourceNote: $('#source-note'), assistantEyebrow: $('#assistant-eyebrow'), assistantTitle: $('#assistant-title'), assistantIntro: $('#assistant-intro'), assistantSpeaker: $('#assistant-speaker'), gameHint: $('#game-hint'), favoritesTitle: $('#favorites-title'), comparisonTitle: $('#comparison-title'), comparisonIntro: $('#comparison-intro'),
  installApp: $('#install-app'), offlineNotice: $('#offline-notice'), installHelp: $('#install-help'), installHelpText: $('#install-help-text'), closeInstallHelp: $('#close-install-help'), themeToggle: $('#theme-toggle'),
  setup: $('#setup'), dashboard: $('#dashboard'), bibleReader: $('#bible-reader'), studyPlan: $('#study-plan'), aiSearch: $('#ai-search'), passageComparator: $('#passage-comparator'), exportCenter: $('#export-center'), help: $('#help'), status: $('#status'),
  scope: $('#scope'), book: $('#book'), books: $('#books'), category: $('#category'), bookField: $('#book-field'), booksField: $('#books-field'), categoryField: $('#category-field'), searchField: $('#search-field'), searchTerm: $('#search-term'), searchHelp: $('#search-help'),
  gameMode: $('#game-mode'), difficulty: $('#difficulty'), count: $('#count'), challenge: $('#challenge'), start: $('#start'),
  quiz: $('#quiz'), progress: $('#progress'), progressBar: $('#progress-bar'), timer: $('#timer'), score: $('#score'), questionType: $('#question-type'),
  question: $('#question'), answers: $('#answers'), feedback: $('#feedback'), report: $('#report'), next: $('#next'),
  result: $('#result'), finalScore: $('#final-score'), finalMessage: $('#final-message'), resultStats: $('#result-stats'), restart: $('#restart'),
  reviewErrors: $('#review-errors'), updateWord: $('#update-word'), createWord: $('#create-word'), wordFile: $('#word-file'), wordContent: $('#word-content'),
  statsGrid: $('#stats-grid'), bookProgress: $('#book-progress'), dailyGoal: $('#daily-goal'), dailyBar: $('#daily-bar'), flaggedCount: $('#flagged-count'), resetProgress: $('#reset-progress'), dailyTarget: $('#daily-target'), weeklyTarget: $('#weekly-target'), saveGoals: $('#save-goals'), weeklyGoal: $('#weekly-goal'), weeklyBar: $('#weekly-bar'), badges: $('#badges'),
  favoriteTotal: $('#favorite-total'), recentAttempts: $('#recent-attempts'), dashboardMessage: $('#dashboard-message'), adaptiveSummary: $('#adaptive-summary'), startAdaptive: $('#start-adaptive'),
  analyticsPeriod: $('#analytics-period'), analyticsMetrics: $('#analytics-metrics'), analyticsChart: $('#analytics-chart'), analyticsStrongest: $('#analytics-strongest'), analyticsStrongestDetail: $('#analytics-strongest-detail'), analyticsWeakest: $('#analytics-weakest'), analyticsWeakestDetail: $('#analytics-weakest-detail'),
  modePerformance: $('#mode-performance'), trainWeakMode: $('#train-weak-mode'),
  readerBook: $('#reader-book'), readerChapter: $('#reader-chapter'), readerVerse: $('#reader-verse'), readerReference: $('#reader-reference'), chapterText: $('#chapter-text'), favoriteVerse: $('#favorite-verse'), favoritesList: $('#favorites-list'), readerFontSize: $('#reader-font-size'), readerSpacing: $('#reader-spacing'), audioReader: $('#audio-reader'), audioStatus: $('#audio-status'), audioLanguageField: $('#audio-language-field'), audioLanguage: $('#audio-language'), speakVerse: $('#speak-verse'), speakChapter: $('#speak-chapter'), pauseSpeech: $('#pause-speech'), stopSpeech: $('#stop-speech'),
  studySummary: $('#study-summary'), studyTitle: $('#study-title'), studyIntro: $('#study-intro'), studySetup: $('#study-setup'), studyDuration: $('#study-duration'), startStudy: $('#start-study'), restartStudy: $('#restart-study'), studyActive: $('#study-active'), studyStats: $('#study-stats'), studyProgressBar: $('#study-progress-bar'), studyTasks: $('#study-tasks'), continueStudy: $('#continue-study'), studyReview: $('#study-review'), studyNotes: $('#study-notes'), studyDeepDive: $('#study-deep-dive'), noteReference: $('#note-reference'), verseNote: $('#verse-note'), saveNote: $('#save-note'), toggleDeepDive: $('#toggle-deep-dive'), completeChapter: $('#complete-chapter'),
  bibleQuery: $('#bible-query'), localSearch: $('#local-search'), smartSearch: $('#smart-search'), searchStatus: $('#search-status'), searchResults: $('#search-results'), assistantThread: $('#assistant-thread'),
  compareABook: $('#compare-a-book'), compareAChapter: $('#compare-a-chapter'), compareAVerse: $('#compare-a-verse'), compareAPreview: $('#compare-a-preview'), compareBBook: $('#compare-b-book'), compareBChapter: $('#compare-b-chapter'), compareBVerse: $('#compare-b-verse'), compareBPreview: $('#compare-b-preview'), analyzeComparison: $('#analyze-comparison'), comparisonStatus: $('#comparison-status'), comparisonAnalysis: $('#comparison-analysis'),
  accountButton: $('#account-button'), accountLabel: $('#account-label'), accountModal: $('#account-modal'), accountGuest: $('#account-guest'), accountUser: $('#account-user'), authForm: $('#auth-form'), authStatus: $('#auth-status'), authSubmit: $('#auth-submit'), displayNameField: $('#display-name-field'), displayName: $('#display-name'), authEmail: $('#auth-email'), authPassword: $('#auth-password'), cloudSetupHint: $('#cloud-setup-hint'), profileAvatar: $('#profile-avatar'), profileName: $('#profile-name'), profileEmail: $('#profile-email'), syncState: $('#sync-state'), syncNow: $('#sync-now'), signOut: $('#sign-out'), forgotPassword: $('#forgot-password'), passwordResetRequest: $('#password-reset-request'), passwordResetForm: $('#password-reset-form'), resetEmail: $('#reset-email'), resetStatus: $('#reset-status'), cancelPasswordReset: $('#cancel-password-reset'), passwordUpdate: $('#password-update'), passwordUpdateForm: $('#password-update-form'), newPassword: $('#new-password'), confirmNewPassword: $('#confirm-new-password'), passwordUpdateStatus: $('#password-update-status'),
  exportMode: $('#export-mode'), exportResult: $('#export-result'), exportPeriod: $('#export-period'), exportBook: $('#export-book'), exportPreview: $('#export-preview'), exportNewWord: $('#export-new-word'), exportUpdateWord: $('#export-update-word'), exportWordFile: $('#export-word-file'), exportHistory: $('#export-history'), exportBackup: $('#export-backup'), restoreBackup: $('#restore-backup'), backupFile: $('#backup-file'), backupStatus: $('#backup-status')
};

function corpusConfig() { return CORPORA[state.corpus] || CORPORA.bible; }
function isHistoryCorpus(config = corpusConfig()) { return config.kind === 'history'; }
function isGeographyCorpus(config = corpusConfig()) { return config.kind === 'geography'; }
function isHumanitiesCorpus(config = corpusConfig()) { return config.domain === 'humanities'; }

const THEME_KEY = 'textes-quiz-theme-v1';
function applyTheme(theme) {
  const selected = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = selected; localStorage.setItem(THEME_KEY, selected);
  elements.themeToggle.textContent = selected === 'dark' ? '☀ Clair' : '☾ Sombre';
  elements.themeToggle.setAttribute('aria-label', selected === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', selected === 'dark' ? '#0d1424' : '#17233c');
}
function initializeTheme() {
  const stored = localStorage.getItem(THEME_KEY); const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(stored || preferred);
}
function toggleTheme() { applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }

function readerPreferences() {
  if (!state.progress.reader || typeof state.progress.reader !== 'object') state.progress.reader = { fontSize: 'normal', spacing: 'comfortable' };
  return state.progress.reader;
}
function applyReaderPreferences() {
  const preferences = readerPreferences();
  const sizes = ['small', 'normal', 'large', 'xlarge']; const spacings = ['compact', 'comfortable', 'wide'];
  preferences.fontSize = sizes.includes(preferences.fontSize) ? preferences.fontSize : 'normal';
  preferences.spacing = spacings.includes(preferences.spacing) ? preferences.spacing : 'comfortable';
  elements.readerFontSize.value = preferences.fontSize; elements.readerSpacing.value = preferences.spacing;
  elements.chapterText.dataset.fontSize = preferences.fontSize; elements.chapterText.dataset.spacing = preferences.spacing;
}
function saveReaderPreferences() {
  const preferences = readerPreferences(); preferences.fontSize = elements.readerFontSize.value; preferences.spacing = elements.readerSpacing.value;
  applyReaderPreferences(); saveState();
}

let installPrompt = null;
function updateOnlineState() { elements.offlineNotice.classList.toggle('hidden', navigator.onLine); }
function isStandaloneApp() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function updateInstallButton() {
  const mobile = window.matchMedia('(max-width: 760px)').matches || navigator.maxTouchPoints > 0;
  elements.installApp.classList.toggle('hidden', isStandaloneApp() || (!installPrompt && !mobile));
  elements.installApp.textContent = mobile ? 'Ajouter à l’écran' : 'Installer l’application';
}
async function installApplication() {
  if (installPrompt) {
    installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; updateInstallButton(); return;
  }
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent);
  elements.installHelpText.textContent = isApple
    ? 'Dans Safari, touche Partager, puis « Sur l’écran d’accueil ».'
    : 'Ouvre le menu ⋮ du navigateur, puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».';
  elements.installHelp.classList.remove('hidden');
}

function saveState() { QuizData.saveHistory(state.history); QuizData.saveProgress(state.progress); QuizData.saveFavorites(state.favorites); }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function questionKey(question) { return normalize(`${question.question}|${question.reference}`).replace(/\s+/g, ' ').trim(); }
function goalData() {
  state.progress.goals = { ...DEFAULT_GOALS, ...(state.progress.goals || {}) };
  return state.progress.goals;
}
function currentWeekKeys() {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0); const mondayOffset = (today.getUTCDay() + 6) % 7; today.setUTCDate(today.getUTCDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => { const day = new Date(today); day.setUTCDate(day.getUTCDate() + index); return day.toISOString().slice(0, 10); });
}
function studyData() {
  state.progress.study = { ...DEFAULT_STUDY, ...(state.progress.study || {}) };
  state.progress.study.completed = Array.isArray(state.progress.study.completed) ? state.progress.study.completed : [];
  state.progress.study.notes = state.progress.study.notes && typeof state.progress.study.notes === 'object' ? state.progress.study.notes : {};
  state.progress.study.deepDive = Array.isArray(state.progress.study.deepDive) ? state.progress.study.deepDive : [];
  return state.progress.study;
}
function chapterKey(book, chapter) { return `${book} ${chapter}`; }
function allStudyChapters() {
  return state.books.flatMap((book, bookIndex) => book.chapters.map((chapter, chapterIndex) => ({ book: book.name, displayBook: book.displayName || book.name, bookIndex, chapterIndex, chapter: chapter.number, reference: chapterKey(book.name, chapter.number) })));
}
function studyDays() {
  const study = studyData(); const chapters = allStudyChapters(); const duration = Number(study.duration) || 0;
  if (!duration) return [];
  return Array.from({ length: duration }, (_, day) => chapters.filter((_, index) => Math.floor(index * duration / chapters.length) === day));
}
function currentStudyDay() {
  const study = studyData(); if (!study.startDate || !study.duration) return 0;
  const elapsed = Math.floor((new Date(todayKey()) - new Date(study.startDate)) / 86400000);
  return Math.max(0, Math.min(Number(study.duration) - 1, elapsed));
}
function startStudyPlan() {
  const study = studyData();
  if (study.duration && !confirm('Créer un nouveau parcours réinitialisera uniquement les chapitres cochés. Tes notes seront conservées. Continuer ?')) return;
  state.progress.study = { ...study, duration: Number(elements.studyDuration.value), startDate: todayKey(), completed: [], lastReference: '', updatedAt: new Date().toISOString() };
  saveState(); renderStudyPlan(); updateDashboard();
}
function resetStudyPlan() {
  const study = studyData(); if (!study.duration) return;
  if (!confirm('Arrêter le parcours actuel ? Tes notes et passages à approfondir seront conservés.')) return;
  state.progress.study = { ...study, duration: 0, startDate: '', completed: [], lastReference: '', updatedAt: new Date().toISOString() }; saveState(); renderStudyPlan(); updateDashboard();
}
function openStudyReference(reference) { openReference(`${reference}:1`); }
function continueStudyReading() {
  const study = studyData(); const days = studyDays();
  const pending = days.flat().find(item => !study.completed.includes(item.reference));
  const reference = study.lastReference ? study.lastReference.replace(/:\d+$/, '') : pending?.reference;
  if (reference) openStudyReference(reference);
}
function toggleStudyTask(reference, checked) {
  const study = studyData();
  study.completed = checked ? [...new Set([...study.completed, reference])] : study.completed.filter(item => item !== reference); study.updatedAt = new Date().toISOString();
  saveState(); renderStudyPlan(); updateDashboard();
}
function renderStudyPlan() {
  const study = studyData(); const active = Boolean(study.duration); const config = corpusConfig();
  elements.studyTitle.textContent = `Mon parcours — ${config.shortName}`;
  elements.studyIntro.textContent = `Un programme quotidien calculé sur ${config.id === 'coran' ? 'les sourates' : `les ${config.itemNamePlural}`} de cet environnement.`;
  elements.studySetup.classList.toggle('hidden', active); elements.studyActive.classList.toggle('hidden', !active); elements.restartStudy.classList.toggle('hidden', !active);
  if (!active) { elements.studySummary.innerHTML = `<strong>Aucun parcours actif.</strong> <button class="secondary compact quick-study" type="button">Créer un parcours</button>`; return; }
  const chapters = allStudyChapters(); const completed = new Set(study.completed); const done = chapters.filter(item => completed.has(item.reference)).length; const percent = chapters.length ? Math.round(done / chapters.length * 100) : 0; const day = currentStudyDay(); const tasks = studyDays()[day] || [];
  elements.studyStats.innerHTML = [[`Jour ${day + 1}/${study.duration}`,'Avancement'],[`${done}/${chapters.length}`,'Chapitres lus'],[`${percent}%`,'Parcours terminé']].map(([value,label]) => `<div class="study-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  elements.studyProgressBar.style.width = `${percent}%`;
  elements.studyTasks.innerHTML = tasks.length ? tasks.map(task => `<label class="study-task${completed.has(task.reference) ? ' done' : ''}"><input type="checkbox" data-study-task="${escapeHtml(task.reference)}" ${completed.has(task.reference) ? 'checked' : ''}><span><strong>${escapeHtml(task.displayBook)}</strong><small>${escapeHtml(task.reference)}</small></span><button class="secondary open-study" data-reference="${escapeHtml(task.reference)}" type="button">Lire</button></label>`).join('') : '<p class="hint">Aucune lecture prévue aujourd’hui.</p>';
  const notes = Object.entries(study.notes).filter(([, note]) => note?.text).sort((a,b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt)).slice(0,6);
  elements.studyNotes.innerHTML = notes.length ? notes.map(([reference,note]) => `<div class="note-item"><strong>${escapeHtml(reference)}</strong><small>${escapeHtml(note.text)}</small><button class="secondary open-note" data-reference="${escapeHtml(reference)}" type="button">Ouvrir</button></div>`).join('') : '<p class="hint">Aucune note enregistrée.</p>';
  elements.studyDeepDive.innerHTML = study.deepDive.length ? [...study.deepDive].reverse().slice(0,8).map(reference => `<div class="note-item"><strong>${escapeHtml(reference)}</strong><button class="secondary open-note" data-reference="${escapeHtml(reference)}" type="button">Ouvrir</button></div>`).join('') : '<p class="hint">Aucun passage marqué.</p>';
  elements.studySummary.innerHTML = `<strong>Parcours ${config.shortName} : ${percent}%</strong><p>Jour ${day + 1} sur ${study.duration} · ${tasks.filter(task => !completed.has(task.reference)).length} lecture(s) restante(s) aujourd’hui.</p><button class="secondary compact quick-study" type="button">Voir mon programme</button>`;
}
function bookFromReference(reference) {
  const ref = normalize(reference);
  return state.books.find(book => ref.startsWith(normalize(book.name)))?.name || 'Autres';
}

function updateCorpusInterface() {
  const config = corpusConfig();
  const isHistory = isHistoryCorpus(config); const isGeography = isGeographyCorpus(config); const isHumanities = isHumanitiesCorpus(config);
  document.body.dataset.corpus = config.id;
  document.body.dataset.domain = config.domain;
  document.title = config.title;
  elements.appTitle.textContent = config.title;
  elements.appSubtitle.textContent = config.subtitle;
  elements.corpusEdition.textContent = config.edition;
  elements.readerTabLabel.textContent = config.shortName;
  elements.scopeLabel.textContent = isHistory ? 'Périmètre historique' : (isGeography ? 'Périmètre géographique' : `Partie ${config.id === 'coran' ? 'du Coran' : `de la ${config.shortName}`}`);
  elements.bookLabel.textContent = config.itemName[0].toUpperCase() + config.itemName.slice(1);
  elements.booksLabel.textContent = `${config.itemNamePlural[0].toUpperCase() + config.itemNamePlural.slice(1)} à mélanger`;
  elements.categoryLabel.textContent = isHistory ? 'Grande époque' : (isGeography ? 'Grand thème' : (config.id === 'coran' ? 'Type de sourates' : 'Catégorie'));
  elements.welcomeTitle.textContent = `Bienvenue dans ton espace ${config.shortName}`;
  elements.openReaderLabel.textContent = isHistory ? 'Ouvrir la chronologie' : (isGeography ? 'Ouvrir les fiches' : `Ouvrir ${config.id === 'coran' ? 'le Coran' : `la ${config.shortName}`}`);
  elements.readerEyebrow.textContent = config.shortName.toUpperCase();
  elements.readerTitle.textContent = config.readerTitle;
  elements.readerBookLabel.textContent = config.itemName[0].toUpperCase() + config.itemName.slice(1);
  elements.readerChapterLabel.textContent = config.id === 'coran' ? 'Numéro de sourate' : (isHumanities ? 'Dossier' : 'Chapitre');
  elements.readerVerseLabel.textContent = isHistory ? 'Aller à l’événement' : (isGeography ? 'Aller au repère' : 'Aller au verset');
  elements.previousChapter.textContent = isHistory ? '← Période précédente' : (isGeography ? '← Rubrique précédente' : '← Chapitre précédent');
  elements.nextChapter.textContent = isHistory ? 'Période suivante →' : (isGeography ? 'Rubrique suivante →' : 'Chapitre suivant →');
  elements.speakVerse.textContent = isHistory ? 'Écouter l’événement' : (isGeography ? 'Écouter le repère' : 'Écouter le verset');
  elements.speakChapter.textContent = isHistory ? 'Écouter la période' : (isGeography ? 'Écouter la rubrique' : 'Écouter le chapitre');
  elements.readerChapterField.classList.toggle('hidden', config.id === 'coran');
  elements.sourceNote.textContent = config.source;
  elements.assistantEyebrow.textContent = `${config.assistantName.toUpperCase()} IA`;
  elements.assistantTitle.textContent = isHistory ? `Interroger et explorer ${config.title.toLowerCase()}` : (isGeography ? `Explorer ${config.title.toLowerCase()}` : `Interroger et explorer ${config.id === 'coran' ? 'le Coran' : `la ${config.shortName}`}`);
  elements.assistantIntro.textContent = isHistory ? 'Pose une question sur une époque, une date, une personnalité ou un événement. L’assistant s’appuie uniquement sur les fiches historiques de cet environnement.' : (isGeography ? 'Recherche un territoire, un relief, une population ou un grand repère. Les réponses sont limitées aux fiches de cet environnement.' : `Pose une question, décris un passage ou recherche un thème. L’assistant s’appuie uniquement sur ${config.id === 'coran' ? 'le Coran' : `la ${config.shortName}`} et affiche ses références.`);
  elements.assistantSpeaker.textContent = config.assistantName;
  elements.bibleQuery.placeholder = isHistory ? 'Ex. Explique-moi les grandes transformations de cette période…' : (isGeography ? 'Ex. Quels sont les principaux reliefs de ce territoire ?' : 'Ex. Trouve-moi un passage sur la persévérance…');
  const suggestions = isHistory ? ['Quels sont les principaux tournants ?', 'Compare deux périodes', 'Trouve les personnages importants'] : (isGeography ? ['Quels sont les principaux reliefs ?', 'Compare deux territoires', 'Trouve les grands foyers de population'] : ['Quels passages parlent du pardon ?', 'Trouve un passage sur la persévérance', 'Que dit ce texte sur la peur ?']);
  document.querySelectorAll('.assistant-suggestions .suggestion').forEach((button, index) => { button.textContent = suggestions[index]; });
  elements.gameHint.textContent = isHistory ? 'Les modes dates, chronologie et faits à compléter fonctionnent localement. Le QCM utilise Gemini.' : (isGeography ? 'Les modes rubriques, vrai ou faux et repères à compléter fonctionnent localement. Le QCM utilise Gemini.' : 'Les modes « référence » et « compléter » fonctionnent localement. Le QCM utilise Gemini.');
  elements.favoritesTitle.textContent = isHistory ? 'Mes événements favoris' : (isGeography ? 'Mes repères favoris' : 'Mes passages favoris');
  elements.comparisonTitle.textContent = isHistory ? 'Comparer deux événements' : (isGeography ? 'Comparer deux repères' : 'Comparer deux passages');
  elements.comparisonIntro.textContent = isHumanities ? 'Place deux fiches côte à côte, puis demande une analyse fondée uniquement sur leur contenu.' : 'Place deux versets côte à côte, puis demande une analyse fondée uniquement sur leur contenu.';
  elements.gameMode.querySelector('[value="reference"]').textContent = isHistory ? 'Retrouver la période' : (isGeography ? 'Retrouver la rubrique' : 'Retrouver la référence');
  elements.gameMode.querySelector('[value="completion"]').textContent = isHistory ? 'Compléter un fait historique' : (isGeography ? 'Compléter un repère' : 'Compléter le verset');
  elements.gameMode.querySelector('[value="date"]').hidden = !isHistory;
  elements.gameMode.querySelector('[value="chronology"]').hidden = !isHistory;
  if (!isHistory && ['date', 'chronology'].includes(elements.gameMode.value)) elements.gameMode.value = 'mixed';
  document.querySelectorAll('.corpus-choice').forEach(button => button.classList.toggle('active', button.dataset.corpus === config.id));
}

function scopeOptions() {
  const config = corpusConfig();
  const isHistory = isHistoryCorpus(config); const isGeography = isGeographyCorpus(config);
  const values = [
    ['all', isHistory ? `Toute ${config.title.toLowerCase()}` : (isGeography ? `Toute ${config.title.toLowerCase()}` : (config.id === 'coran' ? 'Tout le Coran' : `Toute la ${config.shortName}`))],
    ['book', `Une ${config.itemName} précise`], ['books', `Plusieurs ${config.itemNamePlural}`],
    ['category', config.id === 'coran' ? 'Un type de sourates' : 'Une catégorie'],
    ['famous', isHistory ? 'Grands repères historiques' : (isGeography ? 'Repères essentiels' : (config.id === 'coran' ? 'Passages connus' : 'Versets célèbres'))],
    ['search', 'Un personnage ou un thème']
  ];
  if (config.id === 'bible') values.splice(1, 0, ['old', 'Ancien Testament'], ['new', 'Nouveau Testament']);
  elements.scope.replaceChildren(...values.map(([value, label]) => new Option(label, value)));
}

function mergeCorpusParts(parts) {
  const merged = new Map();
  parts.flatMap(part => part.books || []).forEach(book => {
    if (!merged.has(book.name)) merged.set(book.name, { ...book, chapters: (book.chapters || []).map(chapter => ({ ...chapter, verses: [...(chapter.verses || [])] })) });
    else {
      const target = merged.get(book.name);
      (book.chapters || []).forEach(chapter => {
        const existing = target.chapters.find(item => item.number === chapter.number);
        if (existing) existing.verses.push(...(chapter.verses || []));
        else target.chapters.push({ ...chapter, verses: [...(chapter.verses || [])] });
      });
    }
  });
  return [...merged.values()];
}

async function loadCorpus() {
  const config = corpusConfig();
  updateCorpusInterface();
  scopeOptions();
  elements.status.textContent = `Chargement ${config.id === 'coran' ? 'du Coran' : `de la ${config.shortName}`}…`;
  elements.status.className = 'status';
  [elements.scope, elements.gameMode, elements.difficulty, elements.count, elements.challenge, elements.start].forEach(element => { element.disabled = true; });
  try {
    const corpus = config.files
      ? { books: mergeCorpusParts(await Promise.all(config.files.map(async file => { const response = await fetch(file); if (!response.ok) throw new Error(`Erreur ${response.status}`); return response.json(); }))) }
      : await (async () => { const response = await fetch(config.file); if (!response.ok) throw new Error(`Erreur ${response.status}`); const payload = await response.json(); return config.datasetKey ? payload[config.datasetKey] : payload; })();
    if (!corpus?.books?.length) throw new Error('Corpus vide ou introuvable');
    state.books = config.bookLimit ? corpus.books.slice(0, config.bookLimit) : corpus.books;
    state.verses = flattenBible(state.books);
    if (!config.categories.length && isHumanitiesCorpus(config)) config.categories = state.books.map((book, index) => ({ id: book.category || `rubrique-${index}`, label: book.displayName || book.name, start: index, end: index }));
    if (!config.famous.length && isHumanitiesCorpus(config)) config.famous = state.verses.slice(0, 12).map(item => `${item.book} ${item.chapter}:${item.verse}`);
    const options = state.books.map((book, index) => {
      const prefix = config.id === 'bible' ? `${index < 39 ? 'AT' : 'NT'} — ` : '';
      return new Option(`${prefix}${book.displayName || book.name}`, String(index));
    });
    elements.book.replaceChildren(...options.map(option => option.cloneNode(true)));
    elements.books.replaceChildren(...options);
    elements.readerBook.replaceChildren(...state.books.map((book, index) => new Option(book.displayName || book.name, String(index))));
    elements.exportBook.replaceChildren(new Option(`Tous les ${config.itemNamePlural}`, 'all'), ...state.books.map(book => new Option(book.displayName || book.name, book.name)));
    elements.category.replaceChildren(...config.categories.map(category => new Option(category.label, category.id)));
    elements.status.textContent = `${state.books.length} ${config.itemNamePlural} et ${state.verses.length.toLocaleString('fr-FR')} ${isHistoryCorpus(config) ? 'événements' : (isGeographyCorpus(config) ? 'repères' : 'versets')} prêts`;
    elements.status.className = 'status ready';
    [elements.scope, elements.gameMode, elements.difficulty, elements.count, elements.challenge, elements.start].forEach(element => { element.disabled = false; });
    updateReaderControls();
    renderChapter();
    updateDashboard();
    renderStudyPlan();
    updateExportCenter();
  } catch (error) {
    elements.status.textContent = `Impossible de charger ${config.id === 'coran' ? 'le Coran' : `la ${config.shortName}`} : ${error.message}`;
    elements.status.className = 'status error';
  }
}

function flattenBible(books) {
  return books.flatMap((book, bookIndex) => book.chapters.flatMap((chapter, chapterIndex) => chapter.verses.map((verse, verseIndex) => ({
    book: book.name, displayBook: book.displayName || book.name, bookIndex, chapterIndex, verseIndex, chapter: chapter.number, verse: verse.number, text: verse.text.trim(), originalText: verse.originalText || '', category: book.category || '', title: verse.title || '', date: verse.date || '', sortDate: Number(verse.sortDate), sourceUrl: verse.sourceUrl || ''
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
    const category = corpusConfig().categories.find(item => item.id === elements.category.value);
    if (!category) throw new Error('Catégorie inconnue.');
    verses = category.category
      ? verses.filter(item => item.category === category.category)
      : verses.filter(item => item.bookIndex >= category.start && item.bookIndex <= category.end);
  }
  if (scope === 'famous') {
    const famous = new Set(corpusConfig().famous.map(normalize));
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

function sourcePassage(seed) {
  return { reference: `${seed.book} ${seed.chapter}:${seed.verse}`, text: seed.text.trim(), originalText: seed.originalText?.trim() || '' };
}

function referenceQuestion(seed, scoped) {
  const correct = `${seed.book} ${seed.chapter}:${seed.verse}`;
  const sameScope = scoped.filter(item => item !== seed && item.book !== seed.book);
  const historyMode = isHumanitiesCorpus();
  const distractors = randomItems(sameScope.length >= 3 ? sameScope : state.verses.filter(item => item !== seed), 12)
    .map(item => historyMode ? item.book : `${item.book} ${item.chapter}:${item.verse}`);
  const uniqueDistractors = [...new Set(distractors)].filter(item => item !== (historyMode ? seed.book : correct)).slice(0, 3);
  return shuffleQuestion({
    type: 'reference', question: historyMode ? `À quelle ${isHistoryCorpus() ? 'période' : 'rubrique'} appartient ce repère ? « ${seed.title || seed.text} »` : `De quelle référence provient ce verset ? « ${seed.text} »`,
    answers: [historyMode ? seed.book : correct, ...uniqueDistractors], correctIndex: 0,
    explanation: isHumanitiesCorpus() ? `Ce repère appartient à la rubrique « ${seed.book} ».` : `Ce verset se trouve en ${correct}.`, reference: correct, sourceText: seed.text, sourceOriginalText: seed.originalText || ''
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
    question: isHumanitiesCorpus() ? `Vrai ou faux ? Ce repère est classé dans « ${shownReference.replace(/\s+\d+:\d+$/, '')} » : « ${seed.title || seed.text} »` : `Vrai ou faux ? Ce verset se trouve en ${shownReference} : « ${seed.text} »`,
    answers: ['Vrai', 'Faux'], correctIndex: makeTrue ? 0 : 1,
    explanation: makeTrue ? `Oui, il s’agit bien de ${correctReference}.` : `Non, ce verset se trouve en ${correctReference}.`,
    reference: correctReference, sourceText: seed.text, sourceOriginalText: seed.originalText || ''
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
    type: 'completion', question: `${isHistoryCorpus() ? 'Complète ce fait historique' : (isGeographyCorpus() ? 'Complète ce repère géographique' : 'Complète le verset')} : « ${hiddenText} »`, answers: [correctWord, ...unique], correctIndex: 0,
    explanation: `Le mot manquant est « ${correctWord} ».`, reference: `${seed.book} ${seed.chapter}:${seed.verse}`, sourceText: seed.text, sourceOriginalText: seed.originalText || ''
  });
}

function dateQuestion(seed, scoped) {
  const datePool = scoped.filter(item => item !== seed && item.date && item.date !== seed.date);
  const distractors = [...new Set(randomItems(datePool, 10).map(item => item.date))].slice(0, 3);
  while (distractors.length < 3) distractors.push(['1789', '1918', '1958'].find(date => date !== seed.date && !distractors.includes(date)) || `Repère ${distractors.length + 1}`);
  return shuffleQuestion({
    type: 'date', question: `Quand a lieu cet événement : « ${seed.title} » ?`, answers: [seed.date, ...distractors], correctIndex: 0,
    explanation: `${seed.title} a lieu en ${seed.date}.`, reference: `${seed.book} ${seed.chapter}:${seed.verse}`, sourceText: seed.text
  });
}

function chronologyQuestion(seed, scoped) {
  const candidates = randomItems(scoped.filter(item => item !== seed && Number.isFinite(item.sortDate)), 3);
  const events = [seed, ...candidates];
  if (events.length < 4) return dateQuestion(seed, scoped);
  const earliest = events.reduce((best, item) => item.sortDate < best.sortDate ? item : best, events[0]);
  return shuffleQuestion({
    type: 'chronology', question: 'Lequel de ces événements a lieu en premier ?', answers: events.map(item => item.title), correctIndex: events.indexOf(earliest),
    explanation: `${earliest.title} est le plus ancien de cette sélection (${earliest.date}).`, reference: `${earliest.book} ${earliest.chapter}:${earliest.verse}`, sourceText: earliest.text
  });
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function geminiQuestions(seeds, count) {
  if (count === 0) return [];
  const response = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ corpus: state.corpus, corpusLabel: corpusConfig().shortName, passages: seeds.map(sourcePassage), difficulty: elements.difficulty.value, questionCount: count })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'La génération avec Gemini a échoué.');
  if (!Array.isArray(data.questions) || !data.questions.length) throw new Error('Aucune question reçue.');
  const passagesByReference = new Map(seeds.map(seed => [normalizeReference(`${seed.book} ${seed.chapter}:${seed.verse}`), seed]));
  const unique = new Map();
  data.questions.forEach(question => {
    const seed = passagesByReference.get(normalizeReference(question?.reference));
    if (!seed || !isValidGeneratedQuestion(question, seed)) return;
    const prepared = shuffleQuestion({ ...question, reference: `${seed.book} ${seed.chapter}:${seed.verse}`, sourceText: seed.text, sourceOriginalText: seed.originalText || '', type: 'qcm' });
    unique.set(questionKey(prepared), prepared);
  });
  const questions = [...unique.values()].slice(0, count);
  if (!questions.length) throw new Error('Les questions reçues ne sont pas exploitables.');
  return questions;
}

function referenceChapter(reference) {
  return normalize(reference).replace(/:\s*\d.*$/, '').trim();
}

function normalizeReference(reference) {
  return normalize(reference).replace(/\s*:\s*/g, ':').replace(/\s+/g, ' ');
}

function isValidGeneratedQuestion(question, verse) {
  const answers = Array.isArray(question?.answers) ? question.answers.map(answer => typeof answer === 'string' ? answer.trim() : '') : [];
  const sourceQuote = typeof question?.sourceQuote === 'string' ? question.sourceQuote.trim() : '';
  const explanation = typeof question?.explanation === 'string' ? question.explanation.trim() : '';
  const correctIndex = Number(question?.correctIndex);
  const ambiguousWording = /\b(?:celui-ci|celle-ci|ce dernier|cette dernière|ce personnage|cette personne)\b/i.test(question?.question || '')
    || /^(?:qui est|que fait|où va|pourquoi|comment)\s+(?:il|elle)\b/i.test(question?.question?.trim() || '');
  return typeof question?.question === 'string'
    && question.question.trim().length >= 12
    && !ambiguousWording
    && answers.length === 4
    && answers.every(answer => answer.length > 0)
    && new Set(answers.map(answer => normalize(answer))).size === 4
    && Number.isInteger(correctIndex)
    && correctIndex >= 0
    && correctIndex < 4
    && explanation.length >= 12
    && typeof question.reference === 'string'
    && normalizeReference(question.reference) === normalizeReference(`${verse.book} ${verse.chapter}:${verse.verse}`)
    && sourceQuote.length >= 4
    && verse.text.includes(sourceQuote)
    && (normalize(explanation).includes(normalize(answers[correctIndex])) || normalize(explanation).includes(normalize(sourceQuote)));
}

async function createQuiz(forcedMode) {
  const mode = forcedMode || elements.gameMode.value;
  const count = Number(elements.count.value);
  if (mode === 'review') return startReview(count);
  if (mode === 'adaptive') return startAdaptiveQuiz(count);
  let scoped;
  try { scoped = eligibleVerses(); } catch (error) { showSetupError(error.message); return; }
  const seeds = selectSeeds(scoped, count);
  setLoading(true);
  try {
    let questions = [];
    if (mode === 'reference') questions = seeds.map(seed => referenceQuestion(seed, scoped));
    else if (mode === 'completion') questions = seeds.map(seed => completionQuestion(seed, scoped));
    else if (mode === 'truefalse') questions = seeds.map(seed => trueFalseQuestion(seed, scoped));
    else if (mode === 'date') questions = seeds.map(seed => dateQuestion(seed, scoped));
    else if (mode === 'chronology') questions = seeds.map(seed => chronologyQuestion(seed, scoped));
    else if (mode === 'qcm') questions = await geminiQuestions(seeds, count);
    else {
      const geminiCount = Math.ceil(count / 2);
      const localSeeds = seeds.slice(geminiCount);
      let generated = [];
      try { generated = await geminiQuestions(seeds.slice(0, geminiCount), geminiCount); } catch { /* Le mode varié reste disponible sans API. */ }
      const makers = isHistoryCorpus() ? [dateQuestion, chronologyQuestion, trueFalseQuestion, completionQuestion] : [referenceQuestion, completionQuestion, trueFalseQuestion];
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

function adaptivePlan(count = Number(elements.count.value)) {
  return AdaptiveQuiz.buildPlan({ verses: state.verses, history: state.history, progress: state.progress, corpus: state.corpus, count });
}

function startAdaptiveQuiz(count = Number(elements.count.value)) {
  const plan = adaptivePlan(count);
  if (!plan.items.length) { showSetupError('Aucun passage disponible pour cet entraînement.'); return; }
  elements.difficulty.value = plan.difficulty;
  const makers = plan.difficulty === 'facile'
    ? [trueFalseQuestion, trueFalseQuestion, completionQuestion]
    : plan.difficulty === 'difficile'
      ? [referenceQuestion, completionQuestion, referenceQuestion]
      : [completionQuestion, trueFalseQuestion, referenceQuestion];
  const questions = plan.items.map((item, index) => ({
    ...makers[index % makers.length](item.verse, state.verses),
    adaptiveReason: item.reason,
    adaptiveCategory: item.category,
    type: 'adaptive'
  }));
  startQuestions(questions);
}

function startReview(count = 20) {
  const errors = (state.progress.errors || []).filter(item => item?.answers?.length >= 2);
  if (!errors.length) { showSetupError('Aucune erreur à revoir pour le moment. Fais d’abord un quiz.'); return; }
  startQuestions(randomItems(errors, Math.min(count, errors.length)).map(question => ({ ...question, selectedIndex: undefined, type: question.type || 'révision' })));
}

function startQuestions(questions) {
  if (!questions.length) throw new Error('Aucune question disponible.');
  state.questions = questions; state.current = 0; state.score = 0; state.attemptSaved = false; state.currentAttempt = null;
  [elements.setup, elements.dashboard, elements.bibleReader, elements.studyPlan, elements.aiSearch, elements.exportCenter, elements.help, elements.result].forEach(panel => panel.classList.add('hidden'));
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
  const labels = { qcm: 'QCM', truefalse: 'VRAI OU FAUX', reference: isHistoryCorpus() ? 'RETROUVER LA PÉRIODE' : (isGeographyCorpus() ? 'RETROUVER LA RUBRIQUE' : 'RETROUVER LA RÉFÉRENCE'), completion: isHumanitiesCorpus() ? 'COMPLÉTER LE REPÈRE' : 'COMPLÉTER LE VERSET', date: 'RETROUVER LA DATE', chronology: 'CHRONOLOGIE', révision: 'RÉVISION', adaptive: 'ENTRAÎNEMENT ADAPTATIF' };
  elements.questionType.textContent = labels[question.type] || 'QUESTION';
  elements.question.textContent = question.question; elements.answers.replaceChildren();
  if (question.adaptiveReason) elements.questionType.textContent += ` · ${question.adaptiveReason}`;
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
  const source = document.createElement('details'); source.className = 'source-passage';
  const summary = document.createElement('summary'); summary.textContent = 'Voir le passage source';
  const sourceReference = document.createElement('strong'); sourceReference.textContent = question.reference || '';
  source.append(summary, sourceReference);
  if (question.sourceOriginalText) { const original = document.createElement('p'); original.className = 'arabic-text'; original.lang = 'ar'; original.dir = 'rtl'; original.textContent = question.sourceOriginalText; source.append(original); }
  const french = document.createElement('p'); french.className = 'source-french'; french.textContent = question.sourceText || 'Passage source indisponible.'; source.append(french);
  elements.feedback.append(title, explanation, reference, source); elements.feedback.className = `feedback ${isCorrect ? 'success' : 'failure'}`;
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
  state.currentAttempt = { id, date: new Date().toISOString(), corpus: state.corpus, corpusLabel: corpusConfig().shortName, edition: corpusConfig().edition, scope: elements.scope.value, scopeLabel: selectedScopeLabel(), difficulty: elements.difficulty.value, score: state.score,
    questions: state.questions.map(question => ({ question: question.question, answers: [...question.answers], correctIndex: Number(question.correctIndex), selectedIndex: Number(question.selectedIndex), explanation: question.explanation || '', reference: question.reference || '', sourceText: question.sourceText || '', sourceOriginalText: question.sourceOriginalText || '', sourceQuote: question.sourceQuote || '', type: question.type || 'qcm', adaptiveReason: question.adaptiveReason || '' })) };
  state.history.push(state.currentAttempt); state.history = dedupeAttempts(state.history); saveState(); state.attemptSaved = true;
}
function dedupeAttempts(attempts) { const merged = new Map(); attempts.forEach(attempt => merged.set(attempt.id || `${attempt.date}-${attempt.questions?.length}`, attempt)); return [...merged.values()].sort((a, b) => new Date(a.date) - new Date(b.date)); }
function mergeHistories(existing, local) { return dedupeAttempts([...existing, ...local]); }
function carnetFilename(suffix = '') { return `Carnet-Quiz-${corpusConfig().shortName.replace(/[^a-zà-ÿ0-9]+/gi, '-')}${suffix}.docx`; }
function validateCarnetCorpus(history) {
  const corpus = (history || []).find(attempt => attempt?.corpus)?.corpus || 'bible';
  if (corpus !== state.corpus) throw new Error(`Ce carnet appartient à l’environnement ${CORPORA[corpus]?.shortName || corpus}. Ouvre un carnet ${corpusConfig().shortName}.`);
}
function exportHistory() {
  if (elements.wordContent.value === 'all') return state.history;
  return state.history.map(attempt => ({ ...attempt, questions: (attempt.questions || []).filter(question => Number(question.selectedIndex) !== Number(question.correctIndex)) })).filter(attempt => attempt.questions.length);
}

async function createNewCarnet() {
  await withButton(elements.createWord, 'Création du carnet…', async () => {
    const blob = await QuizWord.createCarnet(exportHistory());
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({ suggestedName: carnetFilename(), types: [{ description: 'Document Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); alert('Le nouveau carnet Word a été créé.');
    } else QuizWord.download(blob, carnetFilename());
  });
}

async function updateExistingCarnet() {
  await withButton(elements.updateWord, 'Mise à jour du carnet…', async () => {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: `Carnet Word — ${corpusConfig().shortName}`, accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const existing = await QuizWord.readCarnet(await handle.getFile()); validateCarnetCorpus(existing); const merged = mergeHistories(existing, exportHistory()); const blob = await QuizWord.createCarnet(merged);
      const permission = await handle.requestPermission({ mode: 'readwrite' }); if (permission !== 'granted') throw new Error('Autorisation d’écriture refusée.');
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); state.history = mergeHistories(state.history, merged); saveState();
      alert(`Carnet mis à jour : ${QuizWord.countUniqueQuestions(merged)} question(s) unique(s) conservée(s).`); return;
    }
    elements.wordFile.click();
  });
}

async function updateFallback(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try { const existing = await QuizWord.readCarnet(file); validateCarnetCorpus(existing); const merged = mergeHistories(existing, exportHistory()); const blob = await QuizWord.createCarnet(merged); QuizWord.download(blob, carnetFilename('-MIS-A-JOUR')); state.history = mergeHistories(state.history, merged); saveState(); alert('Le carnet actualisé a été téléchargé. Vérifie-le avant de remplacer l’ancien.'); }
  catch (error) { alert(`Mise à jour impossible : ${error.message}`); } finally { event.target.value = ''; }
}
async function withButton(button, loadingText, action) { const text = button.textContent; button.disabled = true; button.textContent = loadingText; try { await action(); } catch (error) { if (error.name !== 'AbortError') alert(`Opération impossible : ${error.message}`); } finally { button.disabled = false; button.textContent = text; } }

function reportQuestion() {
  const question = state.questions[state.current]; state.progress.flagged ||= []; const key = questionKey(question);
  if (!state.progress.flagged.some(item => questionKey(item) === key)) state.progress.flagged.push({ ...question, reportedAt: new Date().toISOString() });
  saveState(); elements.report.textContent = 'Question signalée'; elements.report.disabled = true;
}

function renderAnalytics() {
  if (!globalThis.QuizAnalytics) return;
  const report = QuizAnalytics.buildReport({ history: state.history, corpus: state.corpus, period: Number(elements.analyticsPeriod.value), now: Date.now() });
  elements.analyticsMetrics.innerHTML = [['Taux de réussite', `${report.successRate}%`], ['Questions', report.answered], ['Jours actifs', report.activeDays], ['Régularité', `${report.streak} j`]].map(([label, value]) => `<div class="analytics-metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
  const visibleDays = report.daily.length > 30 ? report.daily.filter((_, index) => index % Math.ceil(report.daily.length / 30) === 0 || index === report.daily.length - 1) : report.daily;
  elements.analyticsChart.innerHTML = visibleDays.map(day => `<div class="chart-day ${day.answered ? '' : 'empty'}" data-label="${day.date} · ${day.answered ? `${day.rate}% sur ${day.answered} question(s)` : 'aucune activité'}"><i class="chart-bar" style="height:${day.answered ? Math.max(8, day.rate) : 2}%"></i></div>`).join('');
  const itemLabel = corpusConfig().itemName;
  elements.analyticsStrongest.textContent = report.strongest?.label || 'À découvrir'; elements.analyticsStrongestDetail.textContent = report.strongest ? `${report.strongest.rate}% de réussite sur ${report.strongest.answered} question(s).` : `Termine quelques quiz pour identifier ton ${itemLabel} le mieux maîtrisé.`;
  elements.analyticsWeakest.textContent = report.weakest?.label || 'À découvrir'; elements.analyticsWeakestDetail.textContent = report.weakest ? `${report.weakest.rate}% de réussite : ton prochain entraînement peut commencer ici.` : `Au moins deux ${itemLabel}s évalués sont nécessaires pour établir une priorité.`;
  const modeLabels = { qcm: 'QCM', truefalse: 'Vrai ou faux', reference: isHistoryCorpus() ? 'Périodes' : (isGeographyCorpus() ? 'Rubriques' : 'Références'), completion: isHumanitiesCorpus() ? 'Repères à compléter' : 'Versets à compléter', date: 'Dates', chronology: 'Chronologie', adaptive: 'Adaptatif' };
  elements.modePerformance.innerHTML = report.modes.length ? report.modes.map(mode => `<div class="mode-row ${report.weakestMode?.label === mode.label ? 'weak' : ''}"><span>${escapeHtml(modeLabels[mode.label] || mode.label)}</span><div class="mini-track"><i style="width:${mode.rate}%"></i></div><strong>${mode.rate}%</strong></div>`).join('') : '<p class="hint">Les résultats par mode apparaîtront après les premiers quiz.</p>';
  const weakMode = report.weakestMode?.label;
  const supportedModes = ['qcm', 'truefalse', 'reference', 'completion', 'date', 'chronology', 'adaptive'];
  elements.trainWeakMode.classList.toggle('hidden', !supportedModes.includes(weakMode)); elements.trainWeakMode.dataset.mode = supportedModes.includes(weakMode) ? weakMode : '';
}

function renderBadges() {
  const p = state.progress; const success = p.answered ? Math.round(((p.correct || 0) / p.answered) * 100) : 0;
  const definitions = [
    ['Premiers pas', 'Terminer un premier quiz', state.history.length >= 1, '✦'],
    ['Curieux', 'Répondre à 50 questions', (p.answered || 0) >= 50, '◉'],
    ['Explorateur', `Étudier 5 ${corpusConfig().itemNamePlural}`, Object.keys(p.books || {}).length >= 5, '⌖'],
    ['Régulier', 'Atteindre une série de 3', (p.bestStreak || 0) >= 3, '↗'],
    ['Persévérant', 'Atteindre une série de 7', (p.bestStreak || 0) >= 7, '◆'],
    ['Maîtrise', '80 % après 100 questions', (p.answered || 0) >= 100 && success >= 80, '★']
  ];
  elements.badges.innerHTML = definitions.map(([title, description, unlocked, icon]) => `<div class="badge ${unlocked ? 'unlocked' : 'locked'}"><span aria-hidden="true">${icon}</span><div><strong>${title}</strong><small>${unlocked ? 'Débloqué' : description}</small></div></div>`).join('');
}

function saveGoals() {
  state.progress.goals = { dailyQuestions: Number(elements.dailyTarget.value), weeklyDays: Number(elements.weeklyTarget.value) };
  saveState(); updateDashboard();
}

function updateDashboard() {
  const p = state.progress; const success = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  const goals = goalData(); elements.dailyTarget.value = String(goals.dailyQuestions); elements.weeklyTarget.value = String(goals.weeklyDays);
  elements.statsGrid.innerHTML = [
    ['Questions répondues', p.answered || 0], ['Taux de réussite', `${success}%`], ['Série record', p.bestStreak || 0], ['À revoir', (p.errors || []).length]
  ].map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  const rows = Object.entries(p.books || {}).sort((a, b) => b[1].answered - a[1].answered).slice(0, 12);
  elements.bookProgress.innerHTML = rows.length ? rows.map(([book, data]) => { const rate = Math.round((data.correct / data.answered) * 100); return `<div class="book-row"><span>${book}</span><div class="mini-track"><i style="width:${rate}%"></i></div><strong>${rate}%</strong></div>`; }).join('') : `<p class="hint">Les résultats par ${corpusConfig().itemName} apparaîtront après le premier quiz.</p>`;
  const daily = p.days?.[todayKey()] || 0; elements.dailyGoal.textContent = `${daily}/${goals.dailyQuestions} questions aujourd’hui`; elements.dailyBar.style.width = `${Math.min(100, (daily / goals.dailyQuestions) * 100)}%`;
  const activeWeekDays = currentWeekKeys().filter(day => (p.days?.[day] || 0) > 0).length; elements.weeklyGoal.textContent = `${activeWeekDays}/${goals.weeklyDays} jours actifs cette semaine`; elements.weeklyBar.style.width = `${Math.min(100, (activeWeekDays / goals.weeklyDays) * 100)}%`;
  elements.flaggedCount.textContent = `${(p.flagged || []).length} question(s) signalée(s) sur cet appareil.`;
  elements.favoriteTotal.textContent = state.favorites.length;
  elements.favoriteTotal.nextElementSibling.textContent = `passage${state.favorites.length > 1 ? 's' : ''} favori${state.favorites.length > 1 ? 's' : ''}`;
  elements.dashboardMessage.textContent = daily >= goals.dailyQuestions ? 'Objectif quotidien atteint. Bravo !' : daily ? `Encore ${goals.dailyQuestions - daily} question(s) pour atteindre ton objectif.` : 'Commence un quiz ou poursuis ta lecture.';
  const recommendation = adaptivePlan(Number(elements.count.value) || 10);
  elements.adaptiveSummary.textContent = recommendation.summary;
  const recent = [...state.history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  elements.recentAttempts.innerHTML = recent.length ? recent.map(attempt => {
    const total = attempt.questions?.length || 0;
    const modes = [...new Set((attempt.questions || []).map(question => question.type || 'qcm'))].join(', ');
    return `<div class="recent-item"><details><summary><div><strong>${escapeHtml(attempt.scopeLabel || `Quiz ${corpusConfig().shortName}`)}</strong><small>${formatDate(attempt.date)}</small></div><span>${attempt.score ?? 0}/${total}</span></summary><div class="attempt-detail"><span>${escapeHtml(attempt.difficulty || 'niveau standard')}</span><span>${escapeHtml(modes || 'qcm')}</span><span>${total ? Math.round(((attempt.score || 0) / total) * 100) : 0}% de réussite</span></div></details></div>`;
  }).join('') : '<p class="hint">Aucun quiz terminé pour le moment.</p>';
  renderAnalytics();
  renderBadges();
  renderStudyPlan();
}

function switchPanel(id) {
  if (id !== 'bible-reader') stopSpeech();
  clearTimer(); [elements.setup, elements.dashboard, elements.bibleReader, elements.studyPlan, elements.aiSearch, elements.passageComparator, elements.exportCenter, elements.help, elements.quiz, elements.result].forEach(panel => panel.classList.add('hidden'));
  const panel = document.getElementById(id); panel?.classList.remove('hidden'); document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === id));
  if (id === 'dashboard') updateDashboard();
  if (id === 'bible-reader') { renderChapter(); renderFavorites(); }
  if (id === 'study-plan') renderStudyPlan();
  if (id === 'passage-comparator') initializeComparator();
  if (id === 'export-center') updateExportCenter();
}
async function switchCorpus(corpus) {
  if (corpus === state.corpus || !CORPORA[corpus]) return;
  if (!elements.quiz.classList.contains('hidden') && state.questions.length && !confirm('Changer d’environnement abandonnera le quiz en cours. Continuer ?')) return;
  saveState(); clearTimer(); QuizData.setCorpus(corpus); state.corpus = corpus;
  state.history = QuizData.getHistory(); state.progress = QuizData.getProgress(DEFAULT_PROGRESS); state.favorites = QuizData.getFavorites();
  state.questions = []; state.currentAttempt = null; state.selectedReaderVerse = 1;
  elements.assistantThread.innerHTML = `<div class="assistant-message assistant"><strong>${escapeHtml(corpusConfig().assistantName)}</strong><p>Bonjour. Que souhaites-tu rechercher ou comprendre aujourd’hui ?</p></div>`;
  elements.searchResults.replaceChildren(); elements.bibleQuery.value = '';
  const selectedButton = document.querySelector(`.corpus-choice[data-corpus="${CSS.escape(corpus)}"]`); const family = selectedButton?.closest('.environment-family');
  if (family) family.open = true;
  if (matchMedia('(max-width: 620px)').matches) document.querySelectorAll('.environment-family').forEach(item => { if (item !== family) item.open = false; });
  switchPanel('dashboard'); await loadCorpus();
}
function restart() { const config = corpusConfig(); state.questions = []; state.currentAttempt = null; switchPanel('setup'); elements.status.textContent = `${state.books.length} ${config.itemNamePlural} et ${state.verses.length.toLocaleString('fr-FR')} ${isHistoryCorpus(config) ? 'événements' : (isGeographyCorpus(config) ? 'repères' : 'versets')} prêts`; elements.status.className = 'status ready'; window.scrollTo({ top: 0, behavior: 'smooth' }); }

function initializeEnvironmentFamilies() {
  const selected = document.querySelector(`.corpus-choice[data-corpus="${CSS.escape(state.corpus)}"]`); const family = selected?.closest('.environment-family');
  if (family) family.open = true;
  if (matchMedia('(max-width: 620px)').matches) document.querySelectorAll('.environment-family').forEach(item => { if (item !== family) item.open = false; });
}
function updateScopeFields() {
  elements.bookField.classList.toggle('hidden', elements.scope.value !== 'book');
  elements.booksField.classList.toggle('hidden', elements.scope.value !== 'books');
  elements.categoryField.classList.toggle('hidden', elements.scope.value !== 'category');
  elements.searchField.classList.toggle('hidden', elements.scope.value !== 'search');
}

function selectedScopeLabel() {
  if (elements.scope.value === 'book') return elements.book.options[elements.book.selectedIndex]?.text || `Une ${corpusConfig().itemName} précise`;
  if (elements.scope.value === 'books') return [...elements.books.selectedOptions].map(option => option.text).join(', ') || `Plusieurs ${corpusConfig().itemNamePlural}`;
  if (elements.scope.value === 'category') return elements.category.options[elements.category.selectedIndex]?.text || 'Catégorie';
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
  elements.readerVerse.replaceChildren(...chapter.verses.map((verse, index) => new Option(isHumanitiesCorpus() ? `${verse.date} — ${verse.title}` : String(verse.number), String(index))));
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
  return verse ? { bookIndex, chapterIndex, verseIndex, book: book.name, chapter: chapter.number, verse: verse.number, text: verse.text.trim(), originalText: verse.originalText || '', title: verse.title || '', date: verse.date || '', sourceUrl: verse.sourceUrl || '', reference: `${book.name} ${chapter.number}:${verse.number}` } : null;
}

const speechState = { queue: [], index: 0, paused: false, playbackId: 0 };
function speechSupported() { return Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function'); }
function speechVoice(language) {
  const prefix = language.slice(0, 2).toLowerCase();
  return speechSynthesis.getVoices().find(voice => voice.lang?.toLowerCase().startsWith(prefix)) || null;
}
function waitForSpeechVoices(timeout = 1500) {
  if (speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise(resolve => {
    let completed = false;
    const finish = () => { if (completed) return; completed = true; speechSynthesis.removeEventListener?.('voiceschanged', finish); resolve(); };
    speechSynthesis.addEventListener?.('voiceschanged', finish, { once: true });
    setTimeout(finish, timeout);
  });
}
function currentReaderChapter() {
  const book = state.books[Number(elements.readerBook.value) || 0];
  return book?.chapters[Number(elements.readerChapter.value) || 0] || null;
}
function updateSpeechControls(active = speechState.queue.length > 0) {
  const supported = speechSupported();
  elements.audioReader.classList.remove('hidden');
  elements.audioReader.classList.toggle('unsupported', !supported);
  elements.speakVerse.disabled = !supported;
  elements.speakChapter.disabled = !supported;
  elements.audioLanguageField.classList.toggle('hidden', state.corpus !== 'coran');
  elements.pauseSpeech.classList.toggle('hidden', !active); elements.stopSpeech.classList.toggle('hidden', !active);
  elements.pauseSpeech.textContent = speechState.paused ? 'Reprendre' : 'Pause';
  if (!active) elements.audioStatus.textContent = supported ? 'Prêt à lire' : 'Lecture audio indisponible dans ce navigateur';
}
function speakNext() {
  if (speechState.index >= speechState.queue.length) { stopSpeech('Lecture terminée'); return; }
  const playbackId = speechState.playbackId;
  const item = speechState.queue[speechState.index];
  const isArabic = item.lang.toLowerCase().startsWith('ar');
  const voice = speechVoice(item.lang);
  if (isArabic && !voice) { stopSpeech('Voix arabe absente de Windows — ajoute la synthèse vocale arabe dans les paramètres de langue'); return; }
  const utterance = new SpeechSynthesisUtterance(isArabic ? item.text : `${item.verse}. ${item.text}`); utterance.lang = item.lang;
  if (voice) utterance.voice = voice;
  elements.audioStatus.textContent = isHistoryCorpus() ? `Lecture de l’événement ${item.verse}` : (isGeographyCorpus() ? `Lecture du repère ${item.verse}` : `Lecture du verset ${item.verse}`);
  utterance.onend = () => { if (playbackId !== speechState.playbackId || speechState.paused) return; speechState.index += 1; speakNext(); };
  utterance.onerror = event => { if (playbackId === speechState.playbackId && event.error !== 'canceled') stopSpeech('Lecture audio interrompue'); };
  speechSynthesis.speak(utterance);
}
async function startSpeech(scope) {
  if (!speechSupported()) return;
  await waitForSpeechVoices();
  if (elements.audioLanguage.value === 'ar' && !speechVoice('ar')) { elements.audioStatus.textContent = 'Voix arabe absente de Windows — ajoute la synthèse vocale arabe dans les paramètres de langue'; return; }
  speechState.playbackId += 1; speechSynthesis.cancel(); const verseIndex = scope === 'verse' ? Number(elements.readerVerse.value) || 0 : null;
  speechState.queue = QuizSpeech.buildQueue(currentReaderChapter(), elements.audioLanguage.value, verseIndex); speechState.index = 0; speechState.paused = false;
  if (!speechState.queue.length) { elements.audioStatus.textContent = 'Aucun texte à lire'; return; }
  updateSpeechControls(true); speakNext();
}
function toggleSpeechPause() {
  if (!speechState.queue.length) return;
  if (speechState.paused) { speechState.paused = false; speechState.playbackId += 1; speakNext(); }
  else { speechState.paused = true; speechState.playbackId += 1; speechSynthesis.cancel(); elements.audioStatus.textContent = 'Lecture en pause'; }
  updateSpeechControls(true);
}
function stopSpeech(message = 'Prêt à lire') {
  speechState.playbackId += 1; if (speechSupported()) speechSynthesis.cancel(); speechState.queue = []; speechState.index = 0; speechState.paused = false; updateSpeechControls(false); elements.audioStatus.textContent = message;
}

function updateStudyReaderTools() {
  const verse = currentReaderVerse(); if (!verse) return;
  const study = studyData(); const chapterReference = chapterKey(verse.book, verse.chapter);
  elements.noteReference.textContent = verse.reference;
  elements.verseNote.value = study.notes[verse.reference]?.text || '';
  elements.toggleDeepDive.textContent = study.deepDive.includes(verse.reference) ? '★ Retirer de « À approfondir »' : '☆ À approfondir';
  const unit = isHistoryCorpus() ? 'Période' : (isGeographyCorpus() ? 'Rubrique' : 'Chapitre');
  elements.completeChapter.textContent = study.completed.includes(chapterReference) ? `✓ ${unit} étudiée` : `✓ Marquer ${isHistoryCorpus() ? 'la période comme étudiée' : (isGeographyCorpus() ? 'la rubrique comme étudiée' : 'le chapitre comme lu')}`;
}
function saveVerseNote() {
  const verse = currentReaderVerse(); if (!verse) return; const study = studyData(); const text = elements.verseNote.value.trim();
  if (text) study.notes[verse.reference] = { text, updatedAt: new Date().toISOString() }; else delete study.notes[verse.reference];
  study.lastReference = verse.reference; study.updatedAt = new Date().toISOString(); saveState(); updateStudyReaderTools(); renderStudyPlan();
  elements.saveNote.textContent = 'Note enregistrée'; setTimeout(() => { elements.saveNote.textContent = 'Enregistrer la note'; }, 1200);
}
function toggleDeepDive() {
  const verse = currentReaderVerse(); if (!verse) return; const study = studyData();
  study.deepDive = study.deepDive.includes(verse.reference) ? study.deepDive.filter(item => item !== verse.reference) : [...study.deepDive, verse.reference];
  study.lastReference = verse.reference; study.updatedAt = new Date().toISOString(); saveState(); updateStudyReaderTools(); renderStudyPlan();
}
function completeCurrentChapter() {
  const verse = currentReaderVerse(); if (!verse) return; const reference = chapterKey(verse.book, verse.chapter); const study = studyData();
  if (!study.duration) { switchPanel('study-plan'); return; }
  study.completed = study.completed.includes(reference) ? study.completed.filter(item => item !== reference) : [...study.completed, reference];
  study.lastReference = verse.reference; study.updatedAt = new Date().toISOString(); saveState(); updateStudyReaderTools(); renderStudyPlan(); updateDashboard();
}
function startStudyReview() {
  const completed = new Set(studyData().completed); const available = state.verses.filter(verse => completed.has(chapterKey(verse.book, verse.chapter)));
  if (available.length < 4) { alert('Marque d’abord au moins quelques chapitres comme lus.'); return; }
  const seeds = randomItems(available, Math.min(10, available.length)); const makers = isHistoryCorpus() ? [dateQuestion, chronologyQuestion, trueFalseQuestion] : [referenceQuestion, completionQuestion, trueFalseQuestion];
  startQuestions(seeds.map((seed,index) => makers[index % makers.length](seed, available)));
}

function renderChapter() {
  const bookIndex = Number(elements.readerBook.value) || 0;
  const chapterIndex = Number(elements.readerChapter.value) || 0;
  const book = state.books[bookIndex];
  const chapter = book?.chapters[chapterIndex];
  if (!chapter) return;
  elements.readerReference.textContent = corpusConfig().id === 'coran' || isHumanitiesCorpus() ? (book.displayName || book.name) : `${book.name} ${chapter.number}`;
  elements.chapterText.classList.toggle('history-timeline', isHumanitiesCorpus());
  elements.chapterText.innerHTML = isHumanitiesCorpus()
    ? chapter.verses.map((event, index) => `<section class="history-event verse${index === Number(elements.readerVerse.value) ? ' selected' : ''}" data-verse="${index}"><time>${escapeHtml(event.date || '')}</time><h3>${escapeHtml(event.title || '')}</h3><p>${escapeHtml(event.text.replace(/^.*? — .*?\.\s*/, ''))}</p>${event.sourceUrl ? `<a href="${escapeHtml(event.sourceUrl)}" target="_blank" rel="noopener">Consulter la source institutionnelle</a>` : ''}</section>`).join('')
    : chapter.verses.map((verse, index) => `<span class="verse${index === Number(elements.readerVerse.value) ? ' selected' : ''}" data-verse="${index}"><sup class="verse-number">${verse.number}</sup>${verse.originalText ? `<span class="arabic-text" lang="ar" dir="rtl">${escapeHtml(verse.originalText.trim())}</span>` : ''}${escapeHtml(verse.text.trim())} </span>`).join('');
  elements.previousChapter.disabled = bookIndex === 0 && chapterIndex === 0;
  elements.nextChapter.disabled = bookIndex === state.books.length - 1 && chapterIndex === book.chapters.length - 1;
  applyReaderPreferences(); updateFavoriteButton(); updateStudyReaderTools(); updateSpeechControls();
}

function selectReaderVerse(index, scroll = true) {
  state.selectedReaderVerse = Number(index) + 1;
  elements.readerVerse.value = String(index);
  renderChapter(); const study = studyData(); study.lastReference = currentReaderVerse()?.reference || ''; study.updatedAt = new Date().toISOString(); saveState();
  if (scroll) elements.chapterText.querySelector(`[data-verse="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function moveChapter(direction) {
  stopSpeech();
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
  if (existing >= 0) state.favorites.splice(existing, 1); else state.favorites.push({ reference: verse.reference, book: verse.book, chapter: verse.chapter, verse: verse.verse, text: verse.text, originalText: verse.originalText, savedAt: new Date().toISOString() });
  saveState(); updateFavoriteButton(); renderFavorites(); updateDashboard();
}

function updateFavoriteButton() {
  const verse = currentReaderVerse();
  const saved = verse && state.favorites.some(item => item.reference === verse.reference);
  elements.favoriteVerse.textContent = saved ? '★ Retirer des favoris' : '☆ Ajouter aux favoris';
}

function renderFavorites() {
  elements.favoritesList.innerHTML = state.favorites.length ? [...state.favorites].reverse().map(item => `<div class="favorite-item"><strong>${escapeHtml(item.reference)}</strong>${item.originalText ? `<p class="arabic-text">${escapeHtml(item.originalText)}</p>` : ''}<p>${escapeHtml(item.text)}</p><button class="secondary open-reference" data-reference="${escapeHtml(item.reference)}" type="button">Ouvrir</button><button class="secondary remove-favorite" data-reference="${escapeHtml(item.reference)}" type="button">Retirer</button></div>`).join('') : `<p class="hint">Sélectionne un ${corpusConfig().verseName} puis ajoute-le à tes favoris.</p>`;
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
  const title = document.createElement('strong'); title.textContent = role === 'user' ? 'Toi' : corpusConfig().assistantName;
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
      body: JSON.stringify({ corpus: state.corpus, corpusLabel: corpusConfig().shortName, query, passages: context.map(item => ({ reference: item.reference, text: item.originalText ? `${item.originalText}\nTraduction française : ${item.text}` : item.text })) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.answer) throw new Error(data.error || 'Service Assistant indisponible');
    const references = Array.isArray(data.references) ? data.references.filter(reference => state.verses.some(item => `${item.book} ${item.chapter}:${item.verse}` === reference)) : [];
    appendAssistantMessage('assistant', data.answer, references);
    elements.searchStatus.textContent = `Réponse générée uniquement à partir des passages de ${corpusConfig().shortName}. Vérifie toujours les références dans le lecteur.`;
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
  elements.searchResults.innerHTML = results.length ? results.map(item => `<div class="search-result"><strong>${escapeHtml(item.reference)}</strong>${item.originalText ? `<p class="arabic-text">${escapeHtml(item.originalText)}</p>` : ''}<p>${escapeHtml(item.text)}</p><button class="open-reference" data-reference="${escapeHtml(item.reference)}" type="button">Ouvrir</button><button class="secondary save-search-result" data-reference="${escapeHtml(item.reference)}" type="button">Ajouter aux favoris</button></div>`).join('') : '<p class="hint">Aucun résultat. Essaie avec moins de mots ou une formulation différente.</p>';
}

function saveSearchFavorite(reference) {
  const verse = state.verses.find(item => `${item.book} ${item.chapter}:${item.verse}` === reference);
  if (!verse || state.favorites.some(item => item.reference === reference)) return;
  state.favorites.push({ reference, book: verse.book, chapter: verse.chapter, verse: verse.verse, text: verse.text, originalText: verse.originalText || '', savedAt: new Date().toISOString() }); saveState(); updateDashboard();
}

function comparisonFields(side) {
  return side === 'a'
    ? { book: elements.compareABook, chapter: elements.compareAChapter, verse: elements.compareAVerse, preview: elements.compareAPreview }
    : { book: elements.compareBBook, chapter: elements.compareBChapter, verse: elements.compareBVerse, preview: elements.compareBPreview };
}
function comparisonSelection(side) {
  const fields = comparisonFields(side); const book = state.books[Number(fields.book.value) || 0];
  const chapter = book?.chapters[Number(fields.chapter.value) || 0]; const verse = chapter?.verses[Number(fields.verse.value) || 0];
  if (!book || !chapter || !verse) return null;
  return { reference: `${book.name} ${chapter.number}:${verse.number}`, text: verse.text.trim(), originalText: String(verse.originalText || '').trim() };
}
function renderComparisonPreview(side) {
  const fields = comparisonFields(side); const passage = comparisonSelection(side);
  fields.preview.innerHTML = passage ? `<strong>${escapeHtml(passage.reference)}</strong>${passage.originalText ? `<p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(passage.originalText)}</p>` : ''}<p>${escapeHtml(passage.text)}</p>` : '<p>Passage indisponible.</p>';
  elements.comparisonAnalysis.classList.add('hidden');
}
function updateComparisonVerses(side) {
  const fields = comparisonFields(side); const book = state.books[Number(fields.book.value) || 0]; const chapter = book?.chapters[Number(fields.chapter.value) || 0];
  fields.verse.innerHTML = (chapter?.verses || []).map((verse, index) => `<option value="${index}">${verse.number}</option>`).join(''); renderComparisonPreview(side);
}
function updateComparisonChapters(side) {
  const fields = comparisonFields(side); const book = state.books[Number(fields.book.value) || 0];
  fields.chapter.innerHTML = (book?.chapters || []).map((chapter, index) => `<option value="${index}">${chapter.number}</option>`).join(''); updateComparisonVerses(side);
}
function initializeComparator() {
  const options = state.books.map((book, index) => `<option value="${index}">${escapeHtml(book.displayName || book.name)}</option>`).join('');
  if (elements.compareABook.dataset.corpus !== state.corpus) {
    elements.compareABook.innerHTML = options; elements.compareBBook.innerHTML = options;
    elements.compareABook.dataset.corpus = state.corpus; elements.compareBBook.dataset.corpus = state.corpus;
    elements.compareABook.value = '0'; elements.compareBBook.value = '0'; updateComparisonChapters('a'); updateComparisonChapters('b');
    if (elements.compareBVerse.options.length > 1) { elements.compareBVerse.value = '1'; renderComparisonPreview('b'); }
  } else { renderComparisonPreview('a'); renderComparisonPreview('b'); }
  elements.comparisonStatus.textContent = 'La comparaison visuelle fonctionne hors connexion. L’analyse détaillée utilise l’assistant IA.';
}
function localComparisonSummary(first, second) {
  const ignored = new Set('avec dans pour mais cette sont leur leurs plus tout tous une des les aux que qui sur par est'.split(' '));
  const firstWords = new Set(normalize(first.text).split(/[^a-z0-9à-ÿœ]+/).filter(word => word.length > 3 && !ignored.has(word)));
  const shared = [...new Set(normalize(second.text).split(/[^a-z0-9à-ÿœ]+/).filter(word => firstWords.has(word)))].slice(0, 8);
  return shared.length ? `Mots ou idées directement communs aux deux textes : ${shared.join(', ')}. L’assistant IA est temporairement indisponible ; les passages restent affichés côte à côte pour ton étude.` : 'Aucun terme important identique n’a été détecté localement. L’assistant IA est temporairement indisponible ; examine les deux textes affichés côte à côte.';
}
async function analyzeComparison() {
  const first = comparisonSelection('a'); const second = comparisonSelection('b'); if (!first || !second) return;
  elements.analyzeComparison.disabled = true; elements.analyzeComparison.textContent = 'Analyse en cours…'; elements.comparisonStatus.textContent = 'L’assistant compare uniquement les deux passages sélectionnés.';
  try {
    const passages = [first, second].map(item => ({ reference: item.reference, text: item.originalText ? `${item.originalText}\nTraduction française : ${item.text}` : item.text }));
    const response = await fetch(`${API_URL}/assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ corpus: state.corpus, corpusLabel: corpusConfig().shortName, query: 'Compare ces deux passages : relève leurs points communs, leurs différences et leur message propre, sans ajouter d’information extérieure.', passages }) });
    const data = await response.json().catch(() => ({})); if (!response.ok || !data.answer) throw new Error('Analyse indisponible');
    elements.comparisonAnalysis.textContent = data.answer; elements.comparisonStatus.textContent = `Analyse produite uniquement à partir de ${first.reference} et ${second.reference}.`;
  } catch { elements.comparisonAnalysis.textContent = localComparisonSummary(first, second); elements.comparisonStatus.textContent = 'Analyse locale de secours utilisée.'; }
  finally { elements.comparisonAnalysis.classList.remove('hidden'); elements.analyzeComparison.disabled = false; elements.analyzeComparison.textContent = 'Analyser les deux passages avec l’assistant'; }
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
      const handle = await window.showSaveFilePicker({ suggestedName: carnetFilename('-Filtre'), types: [{ description: 'Document Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close();
    } else QuizWord.download(blob, carnetFilename('-Filtre'));
  });
}

async function updateFilteredCarnet() {
  await withButton(elements.exportUpdateWord, 'Mise à jour…', async () => {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: 'Carnet Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }] });
      const existing = await QuizWord.readCarnet(await handle.getFile()); validateCarnetCorpus(existing); const merged = mergeHistories(existing, filteredExportHistory()); const blob = await QuizWord.createCarnet(merged);
      const permission = await handle.requestPermission({ mode: 'readwrite' }); if (permission !== 'granted') throw new Error('Autorisation d’écriture refusée.');
      const writable = await handle.createWritable(); await writable.write(blob); await writable.close(); return;
    }
    elements.exportWordFile.click();
  });
}

async function updateFilteredFallback(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try { const existing = await QuizWord.readCarnet(file); validateCarnetCorpus(existing); const merged = mergeHistories(existing, filteredExportHistory()); QuizWord.download(await QuizWord.createCarnet(merged), carnetFilename('-MIS-A-JOUR')); }
  catch (error) { alert(`Mise à jour impossible : ${error.message}`); } finally { event.target.value = ''; }
}

function downloadGeneralBackup() {
  const snapshot = { ...QuizData.exportSnapshot(), application: 'textes-quiz', appearance: { theme: document.documentElement.dataset.theme || 'light' } };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); const date = new Date().toISOString().slice(0, 10); link.href = url; link.download = `Sauvegarde-Textes-Quiz-${date}.json`; link.click(); URL.revokeObjectURL(url);
  elements.backupStatus.textContent = `Sauvegarde complète créée le ${new Date().toLocaleString('fr-FR')}. Conserve ce fichier en lieu sûr.`;
}
async function restoreGeneralBackup(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    if (file.size > 25 * 1024 * 1024) throw new Error('Le fichier dépasse la taille maximale autorisée.');
    const snapshot = JSON.parse(await file.text());
    if (snapshot.application && snapshot.application !== 'textes-quiz') throw new Error('Ce fichier appartient à une autre application.');
    if (!confirm('Restaurer cette sauvegarde remplacera les données locales actuelles des quatre environnements. Continuer ?')) return;
    elements.backupStatus.textContent = 'Restauration et synchronisation en cours…';
    await QuizData.importSnapshot(snapshot); if (snapshot.appearance?.theme) applyTheme(snapshot.appearance.theme);
    elements.backupStatus.textContent = 'Restauration terminée. L’application va se recharger.'; setTimeout(() => location.reload(), 700);
  } catch (error) { elements.backupStatus.textContent = `Restauration impossible : ${error.message}`; }
  finally { event.target.value = ''; }
}

function resetProgress() {
  if (!confirm('Réinitialiser les statistiques et les erreurs mémorisées sur cet appareil ? Le carnet Word ne sera pas supprimé.')) return;
  state.progress = { ...DEFAULT_PROGRESS, errors: [], usedReferences: [], books: {}, days: {}, flagged: [], goals: { ...DEFAULT_GOALS }, study: { ...DEFAULT_STUDY } }; saveState(); updateDashboard();
}

let authMode = 'signin';
let accountView = 'auto';
function isRecoveryFlow() { return new URLSearchParams(location.search).get('recovery') === '1'; }
function openAccount() {
  accountView = isRecoveryFlow() ? 'update' : 'auto';
  elements.accountModal.classList.remove('hidden');
  updateAccountUI();
  if (isRecoveryFlow()) setAccountView('update');
}
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
  try {
    await QuizData.initialize?.(); updateAccountUI();
    if (isRecoveryFlow()) { elements.accountModal.classList.remove('hidden'); setAccountView('update'); }
  }
  catch (error) { console.warn('Initialisation Supabase impossible', error); }
}

elements.start.addEventListener('click', () => createQuiz()); elements.next.addEventListener('click', nextQuestion); elements.restart.addEventListener('click', restart);
elements.installApp.addEventListener('click', installApplication);
elements.themeToggle.addEventListener('click', toggleTheme);
elements.closeInstallHelp.addEventListener('click', () => elements.installHelp.classList.add('hidden'));
elements.startAdaptive.addEventListener('click', () => startAdaptiveQuiz(Number(elements.count.value)));
elements.analyticsPeriod.addEventListener('change', renderAnalytics);
elements.saveGoals.addEventListener('click', saveGoals);
elements.trainWeakMode.addEventListener('click', () => { const mode = elements.trainWeakMode.dataset.mode; if (!mode) return; elements.gameMode.value = mode; createQuiz(mode); });
document.querySelectorAll('.corpus-choice').forEach(button => button.addEventListener('click', () => switchCorpus(button.dataset.corpus)));
elements.reviewErrors.addEventListener('click', () => startReview(Number(elements.count.value))); elements.report.addEventListener('click', reportQuestion);
elements.updateWord.addEventListener('click', updateExistingCarnet); elements.createWord.addEventListener('click', createNewCarnet); elements.wordFile.addEventListener('change', updateFallback);
elements.scope.addEventListener('change', updateScopeFields); elements.resetProgress.addEventListener('click', resetProgress);
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));
document.querySelectorAll('.quick-nav').forEach(button => button.addEventListener('click', () => switchPanel(button.dataset.target)));
elements.readerBook.addEventListener('change', () => { stopSpeech(); state.selectedReaderVerse = 1; updateReaderControls(); renderChapter(); });
elements.readerChapter.addEventListener('change', () => { stopSpeech(); state.selectedReaderVerse = 1; updateVerseOptions(); renderChapter(); });
elements.readerVerse.addEventListener('change', () => selectReaderVerse(elements.readerVerse.value));
elements.chapterText.addEventListener('click', event => { const verse = event.target.closest('.verse'); if (verse) selectReaderVerse(verse.dataset.verse, false); });
elements.previousChapter.addEventListener('click', () => moveChapter(-1)); elements.nextChapter.addEventListener('click', () => moveChapter(1)); elements.favoriteVerse.addEventListener('click', toggleFavorite);
elements.speakVerse.addEventListener('click', () => startSpeech('verse')); elements.speakChapter.addEventListener('click', () => startSpeech('chapter')); elements.pauseSpeech.addEventListener('click', toggleSpeechPause); elements.stopSpeech.addEventListener('click', () => stopSpeech());
elements.audioLanguage.addEventListener('change', () => stopSpeech());
elements.readerFontSize.addEventListener('change', saveReaderPreferences); elements.readerSpacing.addEventListener('change', saveReaderPreferences);
elements.startStudy.addEventListener('click', startStudyPlan); elements.restartStudy.addEventListener('click', resetStudyPlan); elements.continueStudy.addEventListener('click', continueStudyReading); elements.studyReview.addEventListener('click', startStudyReview);
elements.saveNote.addEventListener('click', saveVerseNote); elements.toggleDeepDive.addEventListener('click', toggleDeepDive); elements.completeChapter.addEventListener('click', completeCurrentChapter);
elements.studySummary.addEventListener('click', event => { if (event.target.closest('.quick-study')) switchPanel('study-plan'); });
elements.studyTasks.addEventListener('change', event => { const checkbox = event.target.closest('[data-study-task]'); if (checkbox) toggleStudyTask(checkbox.dataset.studyTask, checkbox.checked); });
elements.studyTasks.addEventListener('click', event => { const button = event.target.closest('.open-study'); if (button) { event.preventDefault(); openStudyReference(button.dataset.reference); } });
[elements.studyNotes, elements.studyDeepDive].forEach(container => container.addEventListener('click', event => { const button = event.target.closest('.open-note'); if (button) openReference(button.dataset.reference); }));
elements.favoritesList.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.classList.contains('open-reference')) openReference(button.dataset.reference); if (button.classList.contains('remove-favorite')) { state.favorites = state.favorites.filter(item => item.reference !== button.dataset.reference); saveState(); renderFavorites(); updateDashboard(); } });
elements.localSearch.addEventListener('click', () => searchBible(false)); elements.smartSearch.addEventListener('click', askBibleAssistant);
elements.bibleQuery.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askBibleAssistant(); } });
document.querySelectorAll('.suggestion').forEach(button => button.addEventListener('click', () => { elements.bibleQuery.value = button.textContent; askBibleAssistant(); }));
elements.assistantThread.addEventListener('click', event => { const button = event.target.closest('.open-reference'); if (button) openReference(button.dataset.reference); });
elements.searchResults.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.classList.contains('open-reference')) openReference(button.dataset.reference); if (button.classList.contains('save-search-result')) { saveSearchFavorite(button.dataset.reference); button.textContent = 'Ajouté'; button.disabled = true; } });
elements.compareABook.addEventListener('change', () => updateComparisonChapters('a')); elements.compareBBook.addEventListener('change', () => updateComparisonChapters('b'));
elements.compareAChapter.addEventListener('change', () => updateComparisonVerses('a')); elements.compareBChapter.addEventListener('change', () => updateComparisonVerses('b'));
elements.compareAVerse.addEventListener('change', () => renderComparisonPreview('a')); elements.compareBVerse.addEventListener('change', () => renderComparisonPreview('b'));
elements.analyzeComparison.addEventListener('click', analyzeComparison);
[elements.exportMode, elements.exportResult, elements.exportPeriod, elements.exportBook].forEach(select => select.addEventListener('change', updateExportCenter));
elements.exportNewWord.addEventListener('click', createFilteredCarnet); elements.exportUpdateWord.addEventListener('click', updateFilteredCarnet); elements.exportWordFile.addEventListener('change', updateFilteredFallback);
elements.exportBackup.addEventListener('click', downloadGeneralBackup); elements.restoreBackup.addEventListener('click', () => elements.backupFile.click()); elements.backupFile.addEventListener('change', restoreGeneralBackup);
window.addEventListener('beforeunload', clearTimer);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; updateInstallButton(); });
window.addEventListener('appinstalled', () => { installPrompt = null; elements.installHelp.classList.add('hidden'); updateInstallButton(); });
window.addEventListener('resize', updateInstallButton); updateInstallButton();
window.addEventListener('online', updateOnlineState); window.addEventListener('offline', updateOnlineState); updateOnlineState();
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
  if (event.detail?.event === 'PASSWORD_RECOVERY' || isRecoveryFlow()) { elements.accountModal.classList.remove('hidden'); setAccountView('update'); }
  else updateAccountUI();
});
window.addEventListener('quizdata:remote-loaded', () => { state.history = QuizData.getHistory(); state.progress = QuizData.getProgress(DEFAULT_PROGRESS); state.favorites = QuizData.getFavorites(); updateDashboard(); renderFavorites(); renderStudyPlan(); updateExportCenter(); });
window.addEventListener('quizdata:synced', () => { elements.syncState.textContent = 'Données synchronisées'; });
window.addEventListener('quizdata:sync-error', () => { elements.syncState.textContent = 'Synchronisation différée — les données restent enregistrées localement'; });
initializeTheme();
initializeEnvironmentFamilies();
initializePersonalSpace();
loadCorpus();
if ('serviceWorker' in navigator) window.addEventListener('load', async () => {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    await registration.update();
  } catch (error) { console.warn('Mode hors connexion indisponible', error); }
});
