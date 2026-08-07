// Route à intégrer dans le Cloudflare Worker existant.
// Secrets requis dans Cloudflare : GEMINI_API_KEY et, facultativement, GEMINI_MODEL.

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' }
});

export async function handleAssistant(request, env) {
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  const { query, passages, corpus, corpusLabel } = await request.json();
  if (typeof query !== 'string' || query.trim().length < 3) return json({ error: 'Question trop courte.' }, 400);
  if (!Array.isArray(passages) || !passages.length) return json({ error: 'Aucun passage fourni.' }, 400);

  const safePassages = passages.slice(0, 12).map(item => ({
    reference: String(item.reference || '').slice(0, 80),
    text: String(item.text || '').slice(0, 1200)
  }));
  const allowedCorpora = { bible: 'la Bible Louis Segond 1910', torah: 'la Torah (les cinq livres du Pentateuque)', coran: 'le Coran en arabe accompagné de sa traduction française' };
  const sourceLabel = allowedCorpora[corpus] || String(corpusLabel || 'le corpus sélectionné');
  const prompt = `Tu es un assistant d'étude francophone consacré à ${sourceLabel}. Réponds uniquement à partir des extraits fournis.
Règles :
- ne présente jamais une interprétation comme l'unique lecture possible ;
- si les extraits ne suffisent pas, dis-le clairement ;
- reste factuel, respectueux et neutre entre les traditions ;
- pour le Coran, distingue explicitement le texte arabe de sa traduction française ;
- cite précisément les références utilisées ;
- réponds en français, en 2 à 5 paragraphes courts.

Question : ${query.trim()}

Extraits :
${safePassages.map(item => `[${item.reference}] ${item.text}`).join('\n')}

Retourne uniquement un JSON valide sous la forme :
{"answer":"réponse", "references":["Jean 3:16"]}`;

  const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.25 } })
  });
  const result = await response.json();
  if (!response.ok) return json({ error: 'Gemini n’a pas pu répondre.', details: result?.error?.message }, response.status);
  try {
    const parsed = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    return json({ answer: String(parsed.answer || ''), references: Array.isArray(parsed.references) ? parsed.references : [] });
  } catch {
    return json({ error: 'Réponse IA invalide.' }, 502);
  }
}
