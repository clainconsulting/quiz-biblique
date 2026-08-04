const API_URL = 'https://quiz-biblique-api.thomas-clain974.workers.dev';

const state = {
  books: [],
  verses: [],
  questions: [],
  current: 0,
  score: 0,
  answered: false
};

const elements = {
  setup: document.querySelector('#setup'),
  status: document.querySelector('#status'),
  scope: document.querySelector('#scope'),
  difficulty: document.querySelector('#difficulty'),
  count: document.querySelector('#count'),
  start: document.querySelector('#start'),
  quiz: document.querySelector('#quiz'),
  progress: document.querySelector('#progress'),
  progressBar: document.querySelector('#progress-bar'),
  score: document.querySelector('#score'),
  question: document.querySelector('#question'),
  answers: document.querySelector('#answers'),
  feedback: document.querySelector('#feedback'),
  next: document.querySelector('#next'),
  result: document.querySelector('#result'),
  finalScore: document.querySelector('#final-score'),
  finalMessage: document.querySelector('#final-message'),
  restart: document.querySelector('#restart')
};

async function loadBible() {
  try {
    const response = await fetch('bible.json');
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    const bible = await response.json();
    state.books = bible.books;
    state.verses = flattenBible(bible.books);
    elements.status.textContent = `${bible.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets prêts`;
    elements.status.className = 'status ready';
    [elements.scope, elements.difficulty, elements.count, elements.start]
      .forEach(element => { element.disabled = false; });
  } catch (error) {
    elements.status.textContent = `Impossible de charger la Bible : ${error.message}`;
    elements.status.className = 'status error';
  }
}

function flattenBible(books) {
  return books.flatMap((book, bookIndex) =>
    book.chapters.flatMap((chapter, chapterIndex) =>
      chapter.verses.map((verse, verseIndex) => ({
        book: book.name,
        bookIndex,
        chapterIndex,
        verseIndex,
        chapter: chapter.number,
        verse: verse.number,
        text: verse.text.trim()
      }))
    )
  );
}

function scopedVerses(scope) {
  if (scope === 'old') return state.verses.filter(item => item.bookIndex < 39);
  if (scope === 'new') return state.verses.filter(item => item.bookIndex >= 39);
  return state.verses;
}

function randomItems(items, amount) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy.slice(0, amount);
}

function passageAround(seed) {
  const chapter = state.books[seed.bookIndex].chapters[seed.chapterIndex];
  const start = Math.max(0, seed.verseIndex - 1);
  const verses = chapter.verses.slice(start, start + 3);
  const first = verses[0].number;
  const last = verses[verses.length - 1].number;
  return {
    reference: `${seed.book} ${seed.chapter}:${first}${last !== first ? `-${last}` : ''}`,
    text: verses.map(verse => verse.text.trim()).join(' ')
  };
}

async function createQuiz() {
  const questionCount = Number(elements.count.value);
  const seeds = randomItems(scopedVerses(elements.scope.value), questionCount);
  const passages = seeds.map(passageAround);

  setLoading(true);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passages,
        difficulty: elements.difficulty.value,
        questionCount
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'La génération a échoué.');
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Aucune question reçue.');
    }
    state.questions = data.questions.map(shuffleQuestion).slice(0, questionCount);
    state.current = 0;
    state.score = 0;
    elements.setup.classList.add('hidden');
    elements.result.classList.add('hidden');
    elements.quiz.classList.remove('hidden');
    showQuestion();
  } catch (error) {
    elements.status.textContent = `${error.message} Réessaie dans quelques instants.`;
    elements.status.className = 'status error';
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  elements.start.disabled = loading;
  elements.start.textContent = loading ? 'Création du quiz…' : 'Créer mon quiz';
}

function shuffleQuestion(question) {
  const answers = question.answers.map((text, index) => ({
    text,
    correct: index === Number(question.correctIndex)
  }));
  const shuffled = randomItems(answers, answers.length);
  return {
    ...question,
    answers: shuffled.map(answer => answer.text),
    correctIndex: shuffled.findIndex(answer => answer.correct)
  };
}

function showQuestion() {
  state.answered = false;
  const question = state.questions[state.current];
  const total = state.questions.length;
  elements.progress.textContent = `Question ${state.current + 1}/${total}`;
  elements.progressBar.style.width = `${((state.current + 1) / total) * 100}%`;
  elements.score.textContent = `Score : ${state.score}`;
  elements.question.textContent = question.question;
  elements.answers.replaceChildren();
  elements.feedback.className = 'feedback hidden';
  elements.next.classList.add('hidden');

  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'answer';
    button.textContent = answer;
    button.addEventListener('click', () => answerQuestion(index));
    elements.answers.append(button);
  });
}

function answerQuestion(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  const question = state.questions[state.current];
  const buttons = [...elements.answers.querySelectorAll('.answer')];
  const isCorrect = selectedIndex === Number(question.correctIndex);
  if (isCorrect) state.score += 1;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === Number(question.correctIndex)) button.classList.add('correct');
    if (index === selectedIndex && !isCorrect) button.classList.add('wrong');
  });

  elements.score.textContent = `Score : ${state.score}`;
  elements.feedback.innerHTML = '';
  const title = document.createElement('strong');
  title.textContent = isCorrect ? 'Bonne réponse !' : 'Ce n’est pas la bonne réponse.';
  const explanation = document.createElement('p');
  explanation.textContent = question.explanation || '';
  const reference = document.createElement('span');
  reference.textContent = question.reference || '';
  elements.feedback.append(title, explanation, reference);
  elements.feedback.className = `feedback ${isCorrect ? 'success' : 'failure'}`;
  elements.next.textContent = state.current + 1 === state.questions.length
    ? 'Voir mon résultat'
    : 'Question suivante';
  elements.next.classList.remove('hidden');
}

function nextQuestion() {
  if (state.current + 1 < state.questions.length) {
    state.current += 1;
    showQuestion();
    elements.quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  showResult();
}

function showResult() {
  const total = state.questions.length;
  const percentage = Math.round((state.score / total) * 100);
  elements.quiz.classList.add('hidden');
  elements.result.classList.remove('hidden');
  elements.finalScore.textContent = `${state.score}/${total}`;
  elements.finalMessage.textContent = percentage >= 80
    ? 'Excellent résultat !'
    : percentage >= 50
      ? 'Bien joué, continue comme ça.'
      : 'Une nouvelle partie te permettra de progresser.';
  elements.result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function restart() {
  elements.result.classList.add('hidden');
  elements.setup.classList.remove('hidden');
  elements.status.textContent = `${state.books.length} livres et ${state.verses.length.toLocaleString('fr-FR')} versets prêts`;
  elements.status.className = 'status ready';
  elements.setup.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

elements.start.addEventListener('click', createQuiz);
elements.next.addEventListener('click', nextQuestion);
elements.restart.addEventListener('click', restart);
loadBible();
