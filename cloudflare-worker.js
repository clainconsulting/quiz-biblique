// Code complet du Worker Cloudflare de Textes & Quiz.
// Secret requis : GEMINI_API_KEY. Variable facultative : GEMINI_MODEL.
const ALLOWED_ORIGIN = 'https://clainconsulting.github.io';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders() });
}

const CORPUS_LABELS = {
  bible: 'la Bible Louis Segond 1910',
  torah: 'la Torah (les cinq livres du Pentateuque)',
  coran: 'le Coran en arabe accompagné de sa traduction française'
};

function cleanPassages(passages, limit = 20) {
  if (!Array.isArray(passages)) return [];
  return passages.slice(0, limit).map(item => ({
    reference: String(item.reference || '').slice(0, 100),
    text: String(item.text || '').slice(0, 3000)
  })).filter(item => item.reference && item.text);
}

async function callGemini(env, prompt, temperature) {
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, responseMimeType: 'application/json' }
    })
  });
  if (!response.ok) {
    const details = await response.text();
    throw Object.assign(new Error('Gemini n’a pas pu répondre.'), { status: 502, details });
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw Object.assign(new Error('Gemini n’a retourné aucun contenu.'), { status: 502 });
  try { return JSON.parse(text); }
  catch { throw Object.assign(new Error('La réponse de Gemini n’est pas un JSON valide.'), { status: 502 }); }
}

async function generateQuiz(body, env) {
  const passages = cleanPassages(body.passages);
  if (!passages.length) return jsonResponse({ error: 'Aucun passage reçu.' }, 400);
  const corpusLabel = CORPUS_LABELS[body.corpus] || String(body.corpusLabel || 'le corpus sélectionné');
  const difficulty = String(body.difficulty || 'intermédiaire').slice(0, 30);
  const questionCount = Math.min(Math.max(Number(body.questionCount) || 10, 5), 20);
  const prompt = `Tu crées un quiz en français basé uniquement sur les passages fournis de ${corpusLabel}.

Niveau demandé : ${difficulty}
Nombre de questions : ${questionCount}

Consignes :
- crée exactement ${questionCount} questions ;
- chaque question a quatre réponses possibles et une seule réponse correcte ;
- indique correctIndex avec 0, 1, 2 ou 3 ;
- ajoute une courte explication et la référence exacte ;
- n'invente aucune information absente des passages ;
- pour le Coran, distingue le texte arabe de sa traduction et ne présente pas la traduction comme le texte original ;
- retourne uniquement un objet JSON valide.

Format :
{"questions":[{"question":"Texte","answers":["A","B","C","D"],"correctIndex":0,"explanation":"Explication","reference":"Référence"}]}

Passages :
${passages.map(item => `${item.reference} — ${item.text}`).join('\n\n')}`;
  const quiz = await callGemini(env, prompt, 0.8);
  if (!Array.isArray(quiz.questions)) return jsonResponse({ error: 'Le format du quiz généré est incorrect.' }, 502);
  return jsonResponse(quiz);
}

async function answerAssistant(body, env) {
  const passages = cleanPassages(body.passages, 12);
  const query = String(body.query || '').trim().slice(0, 1200);
  if (query.length < 3) return jsonResponse({ error: 'Question trop courte.' }, 400);
  if (!passages.length) return jsonResponse({ error: 'Aucun passage fourni.' }, 400);
  const corpusLabel = CORPUS_LABELS[body.corpus] || String(body.corpusLabel || 'le corpus sélectionné');
  const prompt = `Tu es un assistant d'étude francophone consacré à ${corpusLabel}. Réponds uniquement à partir des extraits fournis.

Règles :
- si les extraits ne suffisent pas, dis-le clairement ;
- reste factuel, respectueux et neutre entre les traditions ;
- ne présente jamais une interprétation comme l'unique lecture possible ;
- pour le Coran, distingue explicitement le texte arabe de sa traduction française ;
- cite précisément les références utilisées ;
- réponds en français, en 2 à 5 paragraphes courts ;
- retourne uniquement un JSON valide.

Question : ${query}

Extraits :
${passages.map(item => `[${item.reference}] ${item.text}`).join('\n')}

Format : {"answer":"réponse","references":["Référence"]}`;
  const answer = await callGemini(env, prompt, 0.25);
  return jsonResponse({ answer: String(answer.answer || ''), references: Array.isArray(answer.references) ? answer.references : [] });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method !== 'POST') return jsonResponse({ error: 'Méthode non autorisée.' }, 405);
    try {
      const body = await request.json();
      const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
      if (path === '/assistant') return await answerAssistant(body, env);
      if (path === '/') return await generateQuiz(body, env);
      return jsonResponse({ error: 'Route inconnue.' }, 404);
    } catch (error) {
      return jsonResponse({ error: error.message || 'Une erreur est survenue.', details: error.details }, error.status || 500);
    }
  }
};
