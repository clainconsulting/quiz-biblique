(function (global) {
  'use strict';

  const NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const W15 = 'http://schemas.microsoft.com/office/word/2012/wordml';

  function escapeXml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function textRun(text, options = {}) {
    const properties = [
      options.bold ? '<w:b/>' : '',
      options.italic ? '<w:i/>' : '',
      options.color ? `<w:color w:val="${options.color}"/>` : ''
    ].join('');
    return `<w:r><w:rPr>${properties}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  function paragraph(text, options = {}) {
    const style = options.style ? `<w:pStyle w:val="${options.style}"/>` : '';
    const numbering = options.list
      ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
      : '';
    const pageBreak = options.pageBreakBefore ? '<w:pageBreakBefore/>' : '';
    const keepNext = options.keepNext ? '<w:keepNext/>' : '';
    const collapsed = options.collapsed ? '<w15:collapsed/>' : '';
    const spacing = options.after === undefined ? '' : `<w:spacing w:after="${options.after}"/>`;
    return `<w:p><w:pPr>${style}${numbering}${pageBreak}${keepNext}${collapsed}${spacing}</w:pPr>${textRun(text, options)}</w:p>`;
  }

  function attemptTitle(attempt, index) {
    const date = new Date(attempt.date);
    const formatted = Number.isNaN(date.getTime())
      ? attempt.date
      : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
    return `Tentative ${index + 1} — ${formatted}`;
  }

  function documentBody(history) {
    const paragraphs = [];
    paragraphs.push(paragraph('CARNET PERSONNEL', { style: 'Kicker' }));
    paragraphs.push(paragraph('Carnet de quiz biblique', { style: 'Title' }));
    paragraphs.push(paragraph('Questions générées à partir de la Bible Louis Segond 1910', { style: 'Subtitle' }));
    paragraphs.push(paragraph(`Mis à jour le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())} • ${history.length} tentative${history.length > 1 ? 's' : ''}`, { style: 'Metadata' }));
    paragraphs.push(paragraph('Mode d’emploi', { style: 'Heading1' }));
    paragraphs.push(paragraph('Dans Word sur ordinateur, cliquez sur la petite flèche à gauche de « Correction » pour afficher ou masquer la bonne réponse, l’explication et la référence biblique.'));
    paragraphs.push(paragraph('Historique des tentatives', { style: 'Heading1' }));

    if (history.length === 0) {
      paragraphs.push(paragraph('Aucune tentative enregistrée.'));
    } else {
      history.forEach((attempt, index) => {
        paragraphs.push(paragraph(`${attemptTitle(attempt, index)} — Score ${attempt.score}/${attempt.questions.length}`, { list: true }));
      });
    }

    history.forEach((attempt, attemptIndex) => {
      paragraphs.push(paragraph(attemptTitle(attempt, attemptIndex), { style: 'Heading1', pageBreakBefore: true }));
      paragraphs.push(paragraph(`Périmètre : ${attempt.scopeLabel}  •  Niveau : ${attempt.difficulty}  •  Score : ${attempt.score}/${attempt.questions.length}`, { style: 'Metadata' }));

      attempt.questions.forEach((question, questionIndex) => {
        paragraphs.push(paragraph(`Question ${questionIndex + 1} — ${question.question}`, { style: 'Heading2', keepNext: true }));
        question.answers.forEach((answer, answerIndex) => {
          paragraphs.push(paragraph(`${String.fromCharCode(65 + answerIndex)}. ${answer}`, { style: 'Answer' }));
        });
        paragraphs.push(paragraph('Correction', { style: 'Heading3', collapsed: true, keepNext: true }));
        const selected = Number(question.selectedIndex);
        const correct = Number(question.correctIndex);
        const result = selected === correct ? 'Bonne réponse' : 'Réponse incorrecte';
        paragraphs.push(paragraph(`Résultat : ${result}`, { bold: true, color: selected === correct ? '167044' : 'A53232' }));
        paragraphs.push(paragraph(`Réponse choisie : ${selected >= 0 ? `${String.fromCharCode(65 + selected)}. ${question.answers[selected]}` : 'Aucune réponse'}`));
        paragraphs.push(paragraph(`Bonne réponse : ${String.fromCharCode(65 + correct)}. ${question.answers[correct]}`, { bold: true }));
        paragraphs.push(paragraph(`Explication : ${question.explanation || 'Non renseignée'}`));
        paragraphs.push(paragraph(`Référence : ${question.reference || 'Non renseignée'}`, { italic: true, color: '7A5A00' }));
      });
    });

    return paragraphs.join('');
  }

  function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${NS}">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="0" w:after="100"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:color w:val="17233C"/><w:sz w:val="60"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="300"/></w:pPr><w:rPr><w:color w:val="667085"/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Kicker"><w:name w:val="Kicker"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="D49A30"/><w:sz w:val="18"/><w:caps/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Metadata"><w:name w:val="Metadata"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="200"/></w:pPr><w:rPr><w:color w:val="667085"/><w:sz w:val="20"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="360" w:after="200"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="17233C"/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="280" w:after="140"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="17233C"/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="200" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="D49A30"/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Answer"><w:name w:val="Answer"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360"/><w:spacing w:after="80"/></w:pPr><w:rPr><w:sz w:val="22"/></w:rPr></w:style>
</w:styles>`;
  }

  function numberingXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="${NS}"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="540"/></w:tabs><w:ind w:left="540" w:hanging="270"/><w:spacing w:after="80" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
  }

  function documentXml(history) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}" xmlns:w15="${W15}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w15"><w:body>${documentBody(history)}<w:sectPr><w:headerReference w:type="default" r:id="rId4" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><w:footerReference w:type="default" r:id="rId5" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  }

  function encodeHistory(history) {
    const bytes = new TextEncoder().encode(JSON.stringify(history));
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function decodeHistory(base64) {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  async function createCarnet(history) {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
    zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
    zip.folder('word').file('document.xml', documentXml(history));
    zip.folder('word').file('styles.xml', stylesXml());
    zip.folder('word').file('numbering.xml', numberingXml());
    zip.folder('word').file('header1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="${NS}">${paragraph('CARNET DE QUIZ BIBLIQUE', { bold: true, color: '667085', after: 0 })}</w:hdr>`);
    zip.folder('word').file('footer1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="${NS}"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:color w:val="667085"/></w:rPr><w:t>Page </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:color w:val="667085"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`);
    zip.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml" Target="../customXml/item1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`);
    zip.folder('customXml').file('item1.xml', `<?xml version="1.0" encoding="UTF-8"?><quizHistory encoding="base64">${encodeHistory(history)}</quizHistory>`);
    const now = new Date().toISOString();
    zip.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Carnet de quiz biblique</dc:title><dc:creator>Quiz biblique</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`);
    zip.folder('docProps').file('app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Quiz biblique</Application></Properties>');
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
  }

  async function readCarnet(file) {
    const zip = await JSZip.loadAsync(file);
    const historyFile = zip.file('customXml/item1.xml');
    if (!historyFile) throw new Error('Ce document ne contient pas un historique compatible.');
    const xml = await historyFile.async('string');
    const match = xml.match(/<quizHistory[^>]*>([\s\S]*?)<\/quizHistory>/);
    if (!match) throw new Error('Historique introuvable dans ce document.');
    const history = decodeHistory(match[1].trim());
    if (!Array.isArray(history)) throw new Error('Historique non valide.');
    return history;
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  global.QuizWord = { createCarnet, readCarnet, download };
})(window);
