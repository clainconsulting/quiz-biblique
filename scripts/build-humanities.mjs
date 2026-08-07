import { writeFile } from 'node:fs/promises';

const S = {
  reunion: 'https://www.departement974.fr/patrimoine-culturel',
  region: 'https://www.regionreunion.com/la-reunion',
  insee: 'https://www.insee.fr/fr/statistiques/2011101?geo=DEP-974',
  onf: 'https://www.onf.fr/onf/forets-et-espaces-naturels/+/18e::forets-de-la-reunion.html',
  unesco: 'https://whc.unesco.org/fr/list/1317/',
  france: 'https://www.vie-publique.fr/fiches/23901-les-collectivites-territoriales-en-france',
  ign: 'https://www.ign.fr/reperes/geographie-de-la-france',
  monde: 'https://www.un.org/fr/about-us/member-states',
  unescoWorld: 'https://www.unesco.org/fr',
  eu: 'https://european-union.europa.eu/principles-countries-history/country-profiles_fr',
  history: 'https://www.lumni.fr/dossier/les-grandes-periodes-de-l-histoire',
  geo: 'https://www.geoportail.gouv.fr/'
};

const datasets = {
  'histoire-reunion': {
    title: 'Histoire de La Réunion',
    groups: [
      ['Peuplement et société coloniale', 'peuplement', [
        [1642, 'Prise de possession française', 'La France prend officiellement possession de l’île alors appelée Mascarin, encore inhabitée de manière permanente.'],
        [1663, 'Premiers habitants permanents', 'Des Français et des Malgaches s’installent durablement dans l’île, amorçant son peuplement permanent.'],
        [1665, 'Installation de la Compagnie des Indes', 'Étienne Regnault arrive avec des colons de la Compagnie française des Indes orientales et devient le premier gouverneur.'],
        [1715, 'Développement du café', 'La culture du caféier est introduite à grande échelle et transforme l’économie ainsi que l’organisation sociale de l’île.'],
        [1764, 'Administration royale', 'Après la faillite de la Compagnie des Indes, l’île passe sous l’administration directe du roi de France.'],
        [1793, 'L’île Bourbon devient La Réunion', 'La Convention nationale remplace le nom Bourbon par La Réunion, en référence à la réunion des fédérés marseillais et des gardes nationaux parisiens.']
      ]],
      ['Abolition et transformations', 'abolition', [
        [1810, 'Occupation britannique', 'Les Britanniques occupent l’île pendant les guerres napoléoniennes.'],
        [1815, 'Retour à la France', 'Le traité de Paris restitue l’île Bourbon à la France.'],
        [1848.1220, 'Abolition de l’esclavage', 'Le commissaire de la République Joseph Napoléon Sébastien Sarda Garriga proclame l’abolition de l’esclavage le 20 décembre.'],
        [1860, 'Essor de l’engagisme', 'Après l’abolition, l’arrivée de travailleurs engagés, notamment venus d’Inde, participe à la diversification de la population.'],
        [1882, 'Chemin de fer et port', 'Le chemin de fer de La Réunion et le port de la Pointe des Galets sont inaugurés, facilitant les déplacements et les échanges.'],
        [1926, 'Naissance de Raymond Barre', 'Le futur Premier ministre français Raymond Barre naît à Saint-Denis de La Réunion.']
      ]],
      ['Département et époque contemporaine', 'contemporain', [
        [1942.1128, 'Ralliement à la France libre', 'Le contre-torpilleur Léopard arrive à Saint-Denis et l’île se rallie à la France libre.'],
        [1946.0319, 'Départementalisation', 'La loi du 19 mars transforme La Réunion en département français d’outre-mer.'],
        [1963, 'Création du BUMIDOM', 'Le Bureau pour le développement des migrations dans les départements d’outre-mer organise de nombreux départs vers la métropole.'],
        [1972, 'Première télévision locale', 'La télévision commence à émettre quotidiennement dans l’île et devient un média majeur de la société réunionnaise.'],
        [1982, 'La décentralisation', 'Les lois de décentralisation renforcent les compétences des collectivités locales et créent la région comme collectivité territoriale.'],
        [1991, 'Émeutes du Chaudron', 'Des troubles importants éclatent dans le quartier du Chaudron à Saint-Denis sur fond de difficultés sociales.'],
        [2010, 'Classement au patrimoine mondial', 'Les Pitons, cirques et remparts de La Réunion sont inscrits au patrimoine mondial de l’UNESCO.'],
        [2015, 'Nouvelle route du Littoral', 'Le chantier de la Nouvelle route du Littoral marque l’un des grands projets d’infrastructure contemporains de l’île.']
      ]]
    ], source: S.reunion
  },
  'histoire-monde': {
    title: 'Histoire du monde',
    groups: [
      ['Premières civilisations', 'antiquite', [
        [-3300, 'Naissance de l’écriture', 'Les premières formes d’écriture apparaissent en Mésopotamie et permettent de conserver comptes, lois et récits.'],
        [-2600, 'Grandes pyramides de Gizeh', 'Les grandes pyramides sont édifiées en Égypte comme tombeaux monumentaux des pharaons.'],
        [-1750, 'Code de Hammurabi', 'Le roi de Babylone fait graver un vaste ensemble de décisions de justice.'],
        [-508, 'Démocratie athénienne', 'Les réformes de Clisthène établissent à Athènes un régime fondé sur la participation des citoyens.'],
        [-221, 'Unification de la Chine', 'Qin Shi Huang unifie plusieurs royaumes et devient le premier empereur de Chine.']
      ]],
      ['Empires antiques', 'empires-antiques', [
        [-27, 'Début de l’Empire romain', 'Octave reçoit le titre d’Auguste et met en place le principat romain.'],
        [313, 'Édit de Milan', 'Constantin et Licinius accordent la liberté de culte aux chrétiens dans l’Empire romain.'],
        [476, 'Fin de l’Empire romain d’Occident', 'La déposition de Romulus Augustule est traditionnellement retenue comme la fin de l’Empire romain d’Occident.'],
        [622, 'Hégire', 'Le départ de Mahomet de La Mecque vers Médine constitue le point de départ du calendrier musulman.'],
        [800, 'Couronnement de Charlemagne', 'Charlemagne est couronné empereur à Rome par le pape Léon III.']
      ]],
      ['Moyen Âge et échanges', 'moyen-age', [
        [1054, 'Schisme entre Orient et Occident', 'La rupture entre Rome et Constantinople consacre la séparation progressive des Églises catholique et orthodoxe.'],
        [1096, 'Première croisade', 'Des armées venues d’Occident partent vers Jérusalem à l’appel du pape Urbain II.'],
        [1206, 'Empire mongol', 'Temüdjin prend le titre de Gengis Khan et rassemble les tribus mongoles.'],
        [1324, 'Pèlerinage de Mansa Moussa', 'Le souverain de l’Empire du Mali effectue un pèlerinage à La Mecque qui manifeste la richesse de son royaume.'],
        [1453, 'Prise de Constantinople', 'Les Ottomans dirigés par Mehmed II prennent Constantinople, mettant fin à l’Empire byzantin.']
      ]],
      ['Époque moderne', 'moderne', [
        [1492, 'Traversée de Christophe Colomb', 'Christophe Colomb atteint les Caraïbes, ouvrant une nouvelle phase d’expansion européenne et de colonisation.'],
        [1517, 'Réforme protestante', 'La diffusion des thèses de Martin Luther déclenche une rupture religieuse majeure en Europe occidentale.'],
        [1600, 'Compagnie anglaise des Indes orientales', 'La compagnie reçoit une charte royale et devient un acteur majeur du commerce asiatique et de la colonisation.'],
        [1776, 'Indépendance américaine', 'Les treize colonies britanniques proclament leur indépendance.'],
        [1789, 'Révolution française', 'La Révolution renverse l’ordre politique et social de l’Ancien Régime et diffuse de nouveaux principes politiques.']
      ]],
      ['Industrialisation et empires', 'xixe', [
        [1804, 'Indépendance d’Haïti', 'Haïti devient le premier État issu d’une révolte d’esclaves victorieuse et la première république noire indépendante.'],
        [1815, 'Congrès de Vienne', 'Les puissances européennes redessinent les frontières après les guerres napoléoniennes.'],
        [1868, 'Ère Meiji au Japon', 'La restauration impériale engage une modernisation rapide de l’État, de l’économie et de l’armée japonaise.'],
        [1884, 'Conférence de Berlin', 'Les puissances européennes fixent des règles pour leurs conquêtes coloniales en Afrique.'],
        [1914, 'Première Guerre mondiale', 'Un conflit industriel et mondial oppose les Empires centraux aux Alliés jusqu’en 1918.']
      ]],
      ['XXe siècle et monde contemporain', 'xxe', [
        [1917, 'Révolution russe', 'Les bolcheviks prennent le pouvoir en Russie et fondent ensuite l’Union soviétique.'],
        [1939, 'Seconde Guerre mondiale', 'L’invasion de la Pologne par l’Allemagne nazie entraîne un conflit mondial qui s’achève en 1945.'],
        [1945, 'Création de l’ONU', 'L’Organisation des Nations unies est fondée pour favoriser la paix et la coopération internationale.'],
        [1960, 'Vague des indépendances africaines', 'Dix-sept pays africains accèdent à l’indépendance au cours de cette année.'],
        [1989, 'Chute du mur de Berlin', 'L’ouverture du mur symbolise l’effondrement des régimes communistes d’Europe de l’Est et la fin prochaine de la guerre froide.']
      ]]
    ], source: S.history
  },
  'geographie-france': {
    title: 'Géographie de la France',
    groups: [
      ['Territoires et organisation', 'territoires', [
        ['Territoire', 'France métropolitaine', 'La France métropolitaine se situe à l’ouest de l’Europe et comprend la Corse.'],
        ['Organisation', 'Dix-huit régions', 'La France compte dix-huit régions administratives, dont cinq situées outre-mer.'],
        ['Organisation', 'Départements', 'Les départements sont des collectivités territoriales et des circonscriptions administratives.'],
        ['Outre-mer', 'Présence mondiale', 'Les territoires ultramarins donnent à la France une présence dans plusieurs océans.'],
        ['Frontières', 'Pays voisins', 'La France métropolitaine partage des frontières terrestres avec huit États.']
      ]],
      ['Reliefs et eaux', 'physique', [
        ['Relief', 'Alpes', 'Les Alpes occupent le sud-est du pays et abritent le mont Blanc, sommet le plus élevé des Alpes.'],
        ['Relief', 'Pyrénées', 'Les Pyrénées forment une barrière montagneuse entre la France et la péninsule Ibérique.'],
        ['Relief', 'Massif central', 'Le Massif central occupe une grande partie du centre-sud et comprend d’anciens ensembles volcaniques.'],
        ['Fleuve', 'Loire', 'La Loire est le plus long fleuve entièrement situé en France.'],
        ['Fleuve', 'Rhône', 'Le Rhône prend sa source en Suisse et se jette dans la mer Méditerranée.']
      ]],
      ['Population et activités', 'humain', [
        ['Métropole', 'Paris', 'Paris est la capitale et le centre de la plus grande aire urbaine française.'],
        ['Façade maritime', 'Le Havre', 'Le Havre est un port majeur de la façade maritime de la Manche.'],
        ['Métropole', 'Lyon', 'Lyon constitue un carrefour majeur entre le nord, les Alpes et la vallée du Rhône.'],
        ['Agriculture', 'Diversité des productions', 'La variété des climats et des sols permet des productions céréalières, viticoles, fruitières et d’élevage.'],
        ['Tourisme', 'Première destination', 'Le patrimoine, les littoraux, les montagnes et les villes attirent de nombreux visiteurs internationaux.']
      ]],
      ['Climats et paysages', 'climats', [
        ['Climat', 'Océanique', 'Le climat océanique domine à l’ouest avec des températures modérées et des pluies réparties dans l’année.'],
        ['Climat', 'Méditerranéen', 'Le sud-est connaît des étés chauds et secs et des pluies parfois intenses en automne.'],
        ['Climat', 'Montagnard', 'L’altitude entraîne des températures plus basses et un enneigement hivernal important.'],
        ['Littoral', 'Trois grandes façades', 'La métropole s’ouvre sur la Manche, l’océan Atlantique et la mer Méditerranée.'],
        ['Bassin', 'Bassin parisien', 'Le Bassin parisien est une vaste plaine sédimentaire organisée autour de la Seine.']
      ]]
    ], source: S.ign
  },
  'geographie-reunion': {
    title: 'Géographie de La Réunion',
    groups: [
      ['Île et volcans', 'relief', [
        ['Océan Indien', 'Une île volcanique', 'La Réunion est une île volcanique de l’archipel des Mascareignes, située dans le sud-ouest de l’océan Indien.'],
        ['Volcan', 'Piton des Neiges', 'Le piton des Neiges est le point culminant de l’île et de l’ensemble des Mascareignes.'],
        ['Volcan', 'Piton de la Fournaise', 'Le piton de la Fournaise est un volcan actif situé dans le sud-est de l’île.'],
        ['Relief', 'Enclos Fouqué', 'L’Enclos Fouqué est la grande caldeira récente au sein de laquelle se trouve le cône terminal du piton de la Fournaise.'],
        ['Patrimoine', 'Pitons, cirques et remparts', 'Une grande partie du cœur montagneux est classée au patrimoine mondial de l’UNESCO.']
      ]],
      ['Cirques et cours d’eau', 'cirques', [
        ['Cirque', 'Mafate', 'Mafate ne possède pas de route traversante et ses îlets sont principalement accessibles à pied ou par hélicoptère.'],
        ['Cirque', 'Cilaos', 'Cilaos se situe au cœur de l’île, au pied du piton des Neiges, et est relié au littoral par une route sinueuse.'],
        ['Cirque', 'Salazie', 'Salazie, très arrosé, est connu pour ses cascades et sa végétation abondante.'],
        ['Rivière', 'Rivière des Galets', 'La rivière des Galets draine une partie du cirque de Mafate vers la côte ouest.'],
        ['Rivière', 'Rivière des Remparts', 'La rivière des Remparts entaille profondément le massif volcanique dans le sud de l’île.']
      ]],
      ['Communes et territoires', 'communes', [
        ['Nord', 'Saint-Denis', 'Saint-Denis est le chef-lieu de La Réunion et la commune la plus peuplée de l’île.'],
        ['Ouest', 'Saint-Paul', 'Saint-Paul s’étend du littoral ouest aux Hauts et occupe une place majeure dans l’histoire du peuplement.'],
        ['Sud', 'Saint-Pierre', 'Saint-Pierre est un pôle urbain, économique et portuaire majeur du sud.'],
        ['Est', 'Saint-Benoît', 'Saint-Benoît est une commune de la côte au vent, marquée par un climat humide.'],
        ['Organisation', 'Vingt-quatre communes', 'La Réunion est divisée en vingt-quatre communes regroupées dans cinq intercommunalités.']
      ]],
      ['Climat et milieux', 'climat', [
        ['Climat', 'Tropical', 'Le climat est tropical, avec une saison chaude et humide et une saison plus fraîche et sèche.'],
        ['Alizés', 'Côte au vent', 'L’est, exposé aux alizés, reçoit généralement davantage de précipitations que l’ouest.'],
        ['Cyclones', 'Risque tropical', 'La saison cyclonique se concentre généralement pendant l’été austral.'],
        ['Étagement', 'Des littoraux aux sommets', 'La forte variation d’altitude crée des étages climatiques et des milieux naturels très diversifiés.'],
        ['Forêt', 'Biodiversité', 'Les forêts naturelles abritent de nombreuses espèces endémiques adaptées aux milieux insulaires.']
      ]]
    ], source: S.region
  },
  'geographie-monde': {
    title: 'Géographie du monde',
    groups: [
      ['Continents', 'continents', [
        ['Asie', 'Le continent le plus vaste', 'L’Asie est le continent le plus vaste et le plus peuplé.'],
        ['Afrique', 'Un continent traversé par l’équateur', 'L’Afrique s’étend de part et d’autre de l’équateur et présente une grande diversité climatique.'],
        ['Amérique', 'Du nord au sud', 'Le continent américain s’étire de l’Arctique jusqu’aux régions subantarctiques.'],
        ['Europe', 'Une péninsule de l’Eurasie', 'L’Europe forme la partie occidentale de la masse continentale eurasiatique.'],
        ['Océanie', 'Un ensemble insulaire', 'L’Océanie réunit l’Australie, la Nouvelle-Zélande et de nombreux archipels du Pacifique.']
      ]],
      ['Océans et climats', 'oceans', [
        ['Océan', 'Pacifique', 'Le Pacifique est le plus vaste et le plus profond des océans.'],
        ['Océan', 'Atlantique', 'L’Atlantique sépare principalement les Amériques de l’Europe et de l’Afrique.'],
        ['Océan', 'Indien', 'L’océan Indien est bordé par l’Afrique, l’Asie, l’Australie et l’océan Austral.'],
        ['Climat', 'Zone intertropicale', 'La zone située entre les deux tropiques reçoit un fort ensoleillement tout au long de l’année.'],
        ['Climat', 'Mousson', 'La mousson correspond à un système saisonnier de vents qui influence fortement les pluies en Asie du Sud et du Sud-Est.']
      ]],
      ['Reliefs et fleuves', 'reliefs', [
        ['Montagne', 'Himalaya', 'L’Himalaya abrite les plus hauts sommets du monde, dont l’Everest.'],
        ['Fleuve', 'Amazone', 'L’Amazone possède le débit moyen le plus élevé du monde et traverse la grande forêt équatoriale sud-américaine.'],
        ['Fleuve', 'Nil', 'Le Nil traverse le nord-est de l’Afrique et a joué un rôle majeur dans le développement de l’Égypte.'],
        ['Désert', 'Sahara', 'Le Sahara est le plus vaste désert chaud du monde.'],
        ['Faille', 'Ceinture de feu', 'Le pourtour du Pacifique concentre de nombreux volcans et séismes liés aux limites de plaques tectoniques.']
      ]],
      ['Peuplements et échanges', 'humain', [
        ['Population', 'Foyers de peuplement', 'L’Asie orientale et l’Asie du Sud comptent parmi les plus grands foyers de peuplement.'],
        ['Urbanisation', 'Métropoles', 'La majorité de la population mondiale vit désormais dans des espaces urbains.'],
        ['Échanges', 'Routes maritimes', 'Une grande partie du commerce mondial de marchandises circule par voie maritime.'],
        ['Canal', 'Suez', 'Le canal de Suez relie la Méditerranée à la mer Rouge et raccourcit les routes entre l’Europe et l’Asie.'],
        ['Canal', 'Panama', 'Le canal de Panama relie les océans Atlantique et Pacifique à travers l’isthme de Panama.']
      ]]
    ], source: S.unescoWorld
  },
  'reperes-monde': {
    title: 'Repères du monde',
    groups: [
      ['Pays et capitales', 'capitales', [
        ['France', 'Paris', 'Paris est la capitale de la France.'],
        ['Japon', 'Tokyo', 'Tokyo est la capitale du Japon.'],
        ['Brésil', 'Brasília', 'Brasília est la capitale fédérale du Brésil depuis 1960.'],
        ['Australie', 'Canberra', 'Canberra, et non Sydney, est la capitale de l’Australie.'],
        ['Afrique du Sud', 'Trois capitales', 'Pretoria accueille l’exécutif, Le Cap le Parlement et Bloemfontein la Cour suprême d’appel.']
      ]],
      ['Drapeaux et symboles', 'drapeaux', [
        ['Japon', 'Le disque solaire', 'Le drapeau japonais porte un disque rouge représentant le soleil sur un fond blanc.'],
        ['Canada', 'La feuille d’érable', 'Le drapeau canadien présente une feuille d’érable rouge entre deux bandes rouges.'],
        ['Brésil', 'Ordem e Progresso', 'Le drapeau brésilien associe le vert, le jaune et un globe bleu portant la devise Ordem e Progresso.'],
        ['Union européenne', 'Douze étoiles', 'Le drapeau européen présente douze étoiles dorées en cercle sur fond bleu.'],
        ['Afrique du Sud', 'Un symbole d’unité', 'Le drapeau adopté en 1994 utilise une forme en Y qui symbolise la convergence.']
      ]],
      ['Organisations et coopération', 'organisations', [
        ['ONU', 'Coopération mondiale', 'L’Organisation des Nations unies rassemble la quasi-totalité des États reconnus et siège à New York.'],
        ['Union européenne', 'Vingt-sept États', 'L’Union européenne est une union politique et économique de vingt-sept États européens.'],
        ['Union africaine', 'Coopération continentale', 'L’Union africaine réunit les États du continent et siège à Addis-Abeba.'],
        ['ASEAN', 'Asie du Sud-Est', 'L’ASEAN favorise la coopération politique et économique en Asie du Sud-Est.'],
        ['Commission de l’océan Indien', 'Coopération régionale', 'La COI rassemble notamment les Comores, la France au titre de La Réunion, Madagascar, Maurice et les Seychelles.']
      ]],
      ['Population, cultures et territoires', 'societes', [
        ['Langues', 'Une grande diversité', 'Plusieurs milliers de langues sont parlées dans le monde, avec des statuts et des aires de diffusion très variables.'],
        ['Migrations', 'Des mobilités multiples', 'Les migrations peuvent être internes ou internationales et répondre à des motifs économiques, familiaux, politiques ou environnementaux.'],
        ['Frontières', 'Des constructions politiques', 'Les frontières délimitent des souverainetés mais peuvent aussi constituer des espaces d’échanges.'],
        ['Géopolitique', 'Détroits stratégiques', 'Les détroits de Malacca et d’Ormuz sont des passages majeurs pour le commerce et les approvisionnements énergétiques.'],
        ['Patrimoine', 'Diversité culturelle', 'L’UNESCO protège des patrimoines matériels et immatériels considérés comme importants pour l’humanité.']
      ]]
    ], source: S.monde
  }
};

function displayDate(value) {
  if (typeof value !== 'number') return String(value);
  const raw = String(value);
  if (!raw.includes('.')) return `${Math.abs(value)}${value < 0 ? ' av. J.-C.' : ''}`;
  const [year, rest] = raw.split('.');
  const digits = rest.padEnd(4, '0');
  return [Number(digits.slice(2, 4)) || null, Number(digits.slice(0, 2)) || null, year].filter(Boolean).join('/');
}

function buildDataset(key, definition) {
  const historical = key.startsWith('histoire');
  return {
    metadata: { title: definition.title, version: 1, generatedAt: '2026-08-07', source: definition.source },
    books: definition.groups.map(([name, category, facts]) => ({
      name, displayName: name, category,
      chapters: [{ number: 1, title: 'Repères essentiels', verses: facts.map(([marker, title, detail], index) => ({
        number: index + 1, title, date: displayDate(marker), sortDate: historical ? marker : null,
        text: `${displayDate(marker)} — ${title}. ${detail}`, sourceUrl: definition.source
      })) }]
    }))
  };
}

const output = Object.fromEntries(Object.entries(datasets).map(([key, definition]) => [key, buildDataset(key, definition)]));
await writeFile(new URL('../humanities.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
for (const [key, corpus] of Object.entries(output)) {
  console.log(`${key}: ${corpus.books.length} rubriques, ${corpus.books.flatMap(book => book.chapters[0].verses).length} fiches.`);
}
