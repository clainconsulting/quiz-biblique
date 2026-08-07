import { writeFile } from 'node:fs/promises';

const sources = {
  assemblee: 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine',
  elysee: 'https://www.elysee.fr/la-presidence/histoire-de-la-presidence-de-la-republique-francaise',
  memoire: 'https://www.cheminsdememoire.gouv.fr/fr'
};

const periods = [
  ['Gaule et Antiquité', 'antiquite', [
    [-52, 'Alésia', 'Après le siège d’Alésia, Vercingétorix se rend à Jules César. La conquête romaine de la Gaule s’achève progressivement.', sources.assemblee],
    [48, 'Claude ouvre le Sénat aux notables gaulois', 'L’empereur Claude défend l’entrée de notables de la Gaule chevelue au Sénat romain, signe de l’intégration des élites gauloises.', sources.assemblee],
    [177, 'Martyrs de Lyon', 'À Lyon, des chrétiens sont persécutés sous le règne de Marc Aurèle. Le récit des martyrs témoigne de l’implantation ancienne du christianisme en Gaule.', sources.assemblee],
    [212, 'Édit de Caracalla', 'L’édit de Caracalla accorde la citoyenneté romaine à la plupart des hommes libres de l’Empire, notamment en Gaule.', sources.assemblee],
    [451, 'Bataille des Champs Catalauniques', 'Une coalition conduite par le général romain Aetius arrête l’armée d’Attila en Gaule lors de la bataille des Champs Catalauniques.', sources.assemblee],
    [481, 'Avènement de Clovis', 'Clovis devient roi des Francs saliens. Ses conquêtes contribuent à unifier une grande partie de la Gaule sous son autorité.', sources.assemblee],
    [496, 'Baptême de Clovis', 'Le baptême de Clovis à Reims, traditionnellement daté vers 496, renforce son alliance avec les évêques et les populations gallo-romaines.', sources.assemblee]
  ]],
  ['Moyen Âge', 'moyen-age', [
    [732, 'Bataille de Poitiers', 'Charles Martel remporte près de Poitiers une victoire contre une armée venue d’al-Andalus.', sources.assemblee],
    [800, 'Couronnement de Charlemagne', 'Le 25 décembre 800, Charlemagne est couronné empereur à Rome par le pape Léon III.', sources.assemblee],
    [843, 'Traité de Verdun', 'Le traité de Verdun partage l’Empire carolingien entre les petits-fils de Charlemagne. Charles le Chauve reçoit la Francie occidentale.', sources.assemblee],
    [987, 'Hugues Capet devient roi', 'Hugues Capet est élu puis sacré roi. Son avènement ouvre la dynastie capétienne.', sources.assemblee],
    [1066, 'Conquête de l’Angleterre', 'Guillaume, duc de Normandie, remporte la bataille d’Hastings et devient roi d’Angleterre.', sources.assemblee],
    [1214, 'Bataille de Bouvines', 'Philippe Auguste remporte à Bouvines une victoire qui affermit l’autorité capétienne.', sources.assemblee],
    [1302, 'Première réunion des États généraux', 'Philippe IV le Bel réunit à Paris des représentants du clergé, de la noblesse et des villes, réunion souvent considérée comme les premiers États généraux.', sources.assemblee]
  ]],
  ['Guerre de Cent Ans et Renaissance', 'renaissance', [
    [1337, 'Début de la guerre de Cent Ans', 'Le conflit dynastique entre les couronnes de France et d’Angleterre ouvre une longue période de guerres qui s’achève en 1453.', sources.assemblee],
    [1415, 'Bataille d’Azincourt', 'L’armée française est vaincue à Azincourt par Henri V d’Angleterre.', sources.assemblee],
    [1429, 'Jeanne d’Arc à Orléans', 'Jeanne d’Arc contribue à lever le siège d’Orléans puis accompagne Charles VII à son sacre à Reims.', sources.assemblee],
    [1453, 'Fin de la guerre de Cent Ans', 'La victoire française de Castillon marque la fin de la guerre de Cent Ans, sauf à Calais qui reste anglaise.', sources.assemblee],
    [1515, 'Bataille de Marignan', 'François Ier remporte la bataille de Marignan au début de son règne.', sources.assemblee],
    [1539, 'Ordonnance de Villers-Cotterêts', 'François Ier impose notamment l’emploi du français dans les actes judiciaires et administratifs du royaume.', sources.assemblee],
    [1598, 'Édit de Nantes', 'Henri IV promulgue l’édit de Nantes, qui accorde aux protestants des garanties religieuses et civiles.', sources.assemblee]
  ]],
  ['Monarchie absolue et Lumières', 'ancien-regime', [
    [1610, 'Assassinat d’Henri IV', 'Henri IV est assassiné à Paris par François Ravaillac. Louis XIII lui succède sous la régence de Marie de Médicis.', sources.assemblee],
    [1624, 'Richelieu entre au Conseil du roi', 'Le cardinal de Richelieu devient le principal ministre de Louis XIII et renforce l’autorité monarchique.', sources.assemblee],
    [1643, 'Début du règne de Louis XIV', 'Louis XIV devient roi à l’âge de quatre ans. Son règne personnel commence en 1661.', sources.assemblee],
    [1682, 'Installation de la Cour à Versailles', 'Louis XIV installe durablement la Cour et le gouvernement à Versailles.', sources.assemblee],
    [1685, 'Révocation de l’édit de Nantes', 'L’édit de Fontainebleau révoque l’édit de Nantes et interdit l’exercice public du culte protestant.', sources.assemblee],
    [1715, 'Mort de Louis XIV', 'Louis XIV meurt après soixante-douze ans de règne. Louis XV lui succède.', sources.assemblee],
    [1751, 'Début de publication de l’Encyclopédie', 'Le premier volume de l’Encyclopédie dirigée par Diderot et d’Alembert paraît à Paris.', sources.assemblee]
  ]],
  ['Révolution française', 'revolution', [
    [1789.0505, 'Ouverture des États généraux', 'Le 5 mai 1789, les États généraux s’ouvrent à Versailles dans un contexte de crise financière et politique.', sources.assemblee],
    [1789.0714, 'Prise de la Bastille', 'Le 14 juillet 1789, des Parisiens prennent la Bastille, symbole de l’arbitraire royal.', sources.assemblee],
    [1789.0804, 'Abolition des privilèges', 'Dans la nuit du 4 août 1789, l’Assemblée constituante met fin aux privilèges de l’Ancien Régime.', sources.assemblee],
    [1789.0826, 'Déclaration des droits de l’homme et du citoyen', 'Le 26 août 1789, l’Assemblée adopte la Déclaration des droits de l’homme et du citoyen.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/revolution-francaise/la-declaration-des-droits-de-l-homme-et-du-citoyen'],
    [1792.0921, 'Proclamation de la République', 'Le 21 septembre 1792, la Convention abolit la royauté. La Première République commence.', sources.assemblee],
    [1793.0121, 'Exécution de Louis XVI', 'Le 21 janvier 1793, Louis XVI est guillotiné à Paris après sa condamnation par la Convention.', sources.assemblee],
    [1799.1109, 'Coup d’État du 18 Brumaire', 'Les 9 et 10 novembre 1799, Bonaparte renverse le Directoire et établit le Consulat.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/revolution-francaise/le-coup-d-etat-des-18-et-19-brumaire-an-viii']
  ]],
  ['Consulat et Premier Empire', 'empire', [
    [1801, 'Concordat', 'Le Concordat conclu avec le pape Pie VII réorganise les relations entre l’État français et l’Église catholique.', sources.assemblee],
    [1804.0321, 'Code civil', 'Le Code civil est promulgué le 21 mars 1804. Il unifie une grande partie du droit civil français.', sources.assemblee],
    [1804.1202, 'Sacre de Napoléon Ier', 'Napoléon Bonaparte est sacré empereur des Français à Notre-Dame de Paris.', sources.assemblee],
    [1805.1202, 'Bataille d’Austerlitz', 'Napoléon remporte à Austerlitz une victoire décisive contre les armées russe et autrichienne.', sources.assemblee],
    [1812, 'Campagne de Russie', 'La Grande Armée envahit la Russie mais la campagne s’achève par une retraite désastreuse.', sources.assemblee],
    [1814, 'Première abdication de Napoléon', 'Après l’entrée des Alliés à Paris, Napoléon abdique et part pour l’île d’Elbe.', sources.assemblee],
    [1815.0618, 'Bataille de Waterloo', 'La défaite de Napoléon à Waterloo met fin aux Cent-Jours et au Premier Empire.', sources.assemblee]
  ]],
  ['Monarchies et révolutions du XIXe siècle', 'xixe', [
    [1814, 'Charte constitutionnelle', 'Louis XVIII octroie une Charte qui établit une monarchie constitutionnelle.', sources.assemblee],
    [1830.0727, 'Trois Glorieuses', 'Les journées des 27, 28 et 29 juillet 1830 renversent Charles X et ouvrent la Monarchie de Juillet.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/monarchie-de-juillet'],
    [1848.0224, 'Proclamation de la Deuxième République', 'La révolution de février renverse Louis-Philippe et conduit à la proclamation de la Deuxième République.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/deuxieme-republique'],
    [1848.0305, 'Suffrage universel masculin', 'Un décret instaure le suffrage universel masculin pour les Français âgés d’au moins vingt et un ans.', sources.assemblee],
    [1848.0427, 'Abolition de l’esclavage', 'Le décret du 27 avril 1848 abolit définitivement l’esclavage dans les colonies françaises.', sources.assemblee],
    [1852.1202, 'Proclamation du Second Empire', 'Louis-Napoléon Bonaparte devient Napoléon III et proclame le Second Empire.', sources.assemblee],
    [1870.0904, 'Proclamation de la Troisième République', 'Après la défaite de Sedan, la République est proclamée à Paris le 4 septembre 1870.', sources.assemblee]
  ]],
  ['Troisième République', 'troisieme-republique', [
    [1871.0318, 'Début de la Commune de Paris', 'Une insurrection parisienne établit la Commune, réprimée pendant la Semaine sanglante de mai 1871.', sources.assemblee],
    [1875, 'Lois constitutionnelles', 'Les lois constitutionnelles de 1875 organisent durablement les institutions de la Troisième République.', sources.assemblee],
    [1881, 'Liberté de la presse et école primaire', 'La loi du 29 juillet garantit la liberté de la presse ; les lois Ferry rendent l’enseignement primaire public gratuit puis obligatoire et laïque.', sources.assemblee],
    [1894, 'Début de l’affaire Dreyfus', 'Le capitaine Alfred Dreyfus est condamné à tort pour trahison, ouvrant une crise politique et morale majeure.', sources.assemblee],
    [1905.1209, 'Séparation des Églises et de l’État', 'La loi du 9 décembre 1905 affirme la liberté de conscience et organise la séparation des Églises et de l’État.', sources.assemblee],
    [1914.0803, 'Entrée dans la Première Guerre mondiale', 'L’Allemagne déclare la guerre à la France le 3 août 1914.', sources.memoire],
    [1918.1111, 'Armistice de 1918', 'L’armistice signé le 11 novembre 1918 met fin aux combats de la Première Guerre mondiale sur le front occidental.', sources.memoire]
  ]],
  ['Seconde Guerre mondiale', 'seconde-guerre', [
    [1939.0903, 'La France entre en guerre', 'La France et le Royaume-Uni déclarent la guerre à l’Allemagne après l’invasion de la Pologne.', sources.memoire],
    [1940.0618, 'Appel du 18 Juin', 'Depuis Londres, le général de Gaulle appelle à poursuivre le combat contre l’Allemagne nazie.', sources.memoire],
    [1940.0622, 'Armistice de 1940', 'L’armistice franco-allemand est signé à Rethondes. Le territoire français est divisé en plusieurs zones.', sources.memoire],
    [1940.0710, 'Pleins pouvoirs à Pétain', 'Le Parlement réuni à Vichy accorde les pleins pouvoirs constituants au maréchal Pétain.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/deuxieme-guerre-mondiale'],
    [1943.0527, 'Première réunion du CNR', 'Le Conseil national de la Résistance se réunit pour la première fois à Paris sous la présidence de Jean Moulin.', sources.memoire],
    [1944.0825, 'Libération de Paris', 'Paris est libéré après l’insurrection parisienne et l’entrée des forces françaises et alliées.', sources.memoire],
    [1945.0508, 'Victoire en Europe', 'Le 8 mai 1945 marque en France la victoire des Alliés sur l’Allemagne nazie.', sources.memoire]
  ]],
  ['Quatrième République et décolonisation', 'quatrieme-republique', [
    [1944.0421, 'Droit de vote des femmes', 'Une ordonnance du Gouvernement provisoire accorde aux Françaises le droit de vote et d’éligibilité.', sources.assemblee],
    [1945.1021, 'Premier vote des femmes aux législatives', 'Les femmes participent pour la première fois à une élection législative nationale en France.', sources.assemblee],
    [1946.1027, 'Naissance de la Quatrième République', 'La Constitution de la Quatrième République est promulguée le 27 octobre 1946.', sources.assemblee],
    [1950.0509, 'Déclaration Schuman', 'Robert Schuman propose de placer les productions française et allemande de charbon et d’acier sous une autorité commune.', sources.elysee],
    [1954.0507, 'Chute de Diên Biên Phu', 'La défaite française de Diên Biên Phu précède les accords de Genève et la fin de la guerre d’Indochine.', sources.memoire],
    [1954.1101, 'Début de la guerre d’Algérie', 'Une série d’attentats organisée par le FLN marque le début de la guerre d’Algérie.', sources.memoire],
    [1957.0325, 'Traités de Rome', 'La France et cinq autres États signent les traités instituant la Communauté économique européenne et Euratom.', sources.elysee]
  ]],
  ['Cinquième République', 'cinquieme-republique', [
    [1958.1004, 'Constitution de la Cinquième République', 'La Constitution approuvée par référendum est promulguée le 4 octobre 1958.', 'https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/cinquieme-republique'],
    [1962.0318, 'Accords d’Évian', 'Les accords d’Évian conduisent au cessez-le-feu en Algérie puis à l’indépendance.', sources.memoire],
    [1962.1028, 'Président élu au suffrage universel direct', 'Un référendum approuve l’élection du président de la République au suffrage universel direct.', sources.elysee],
    [1968.05, 'Mai 1968', 'Une crise étudiante, sociale et politique entraîne des grèves massives et les accords de Grenelle.', sources.assemblee],
    [1981.0510, 'Élection de François Mitterrand', 'François Mitterrand est élu président de la République, première alternance de la Cinquième République.', 'https://www.elysee.fr/la-presidence/les-presidents-de-la-republique'],
    [1981.1009, 'Abolition de la peine de mort', 'La loi abolissant la peine de mort est promulguée le 9 octobre 1981.', sources.assemblee],
    [2000.0924, 'Référendum sur le quinquennat', 'Les électeurs approuvent la réduction du mandat présidentiel de sept à cinq ans.', sources.elysee]
  ]],
  ['France contemporaine', 'contemporain', [
    [1992.0207, 'Traité de Maastricht', 'La France signe le traité de Maastricht, qui fonde l’Union européenne.', sources.elysee],
    [1995.0716, 'Reconnaissance de la responsabilité de l’État dans la rafle du Vél’ d’Hiv', 'Jacques Chirac reconnaît la responsabilité de l’État français dans les persécutions antisémites commises pendant l’Occupation.', 'https://www.elysee.fr/jacques-chirac'],
    [1999, 'Pacte civil de solidarité', 'La loi crée le pacte civil de solidarité, contrat ouvert à deux personnes majeures.', sources.assemblee],
    [2002.0101, 'Mise en circulation de l’euro', 'Les billets et pièces en euros entrent en circulation en France et dans onze autres États.', sources.elysee],
    [2004.0301, 'Charte de l’environnement', 'Le Parlement réuni en Congrès adopte la Charte de l’environnement, intégrée au bloc de constitutionnalité.', sources.assemblee],
    [2013.0517, 'Mariage ouvert aux couples de même sexe', 'La loi du 17 mai 2013 ouvre le mariage et l’adoption aux couples de même sexe.', sources.assemblee],
    [2015.0111, 'Marche républicaine', 'Après les attentats de janvier 2015, une marche républicaine rassemble plusieurs millions de personnes en France.', sources.elysee]
  ]]
];

function displayDate(value) {
  const raw = String(value);
  if (!raw.includes('.')) return `${Math.abs(Number(value))}${Number(value) < 0 ? ' av. J.-C.' : ''}`;
  const [year, rest] = raw.split('.');
  const digits = rest.padEnd(4, '0');
  const month = Number(digits.slice(0, 2));
  const day = Number(digits.slice(2, 4));
  if (month === 5 && day === 0) return `mai ${year}`;
  return [day || null, month || null, year].filter(Boolean).join('/');
}

const corpus = {
  metadata: { title: 'Histoire de France', version: 1, generatedAt: '2026-08-07', sources: Object.values(sources) },
  books: periods.map(([name, category, events]) => ({
    name,
    displayName: name,
    category,
    chapters: [{
      number: 1,
      title: 'Repères essentiels',
      verses: events.map(([sortDate, title, text, sourceUrl], index) => ({
        number: index + 1,
        title,
        date: displayDate(sortDate),
        sortDate,
        text: `${displayDate(sortDate)} — ${title}. ${text}`,
        sourceUrl
      }))
    }]
  }))
};

await writeFile(new URL('../history-france.json', import.meta.url), `${JSON.stringify(corpus, null, 2)}\n`);
console.log(`${corpus.books.length} périodes et ${corpus.books.flatMap(book => book.chapters[0].verses).length} événements générés.`);
