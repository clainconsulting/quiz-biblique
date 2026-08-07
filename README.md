# Textes & Quiz — Bible, Torah et Coran

Application Web personnelle d’étude, de lecture et de quiz avec trois environnements indépendants.

## Fonctionnalités

- Trois espaces séparés : Bible, Torah et Coran
- Historique, progression, favoris, erreurs et carnets Word indépendants pour chaque espace
- Bible complète structurée par livre, chapitre et verset
- Torah structurée sur les cinq livres du Pentateuque en français
- Coran complet : 114 sourates et 6 236 versets, arabe et traduction française
- Quiz générés aléatoirement avec Gemini
- Toute la Bible, Ancien Testament, Nouveau Testament, un ou plusieurs livres, catégories bibliques, versets célèbres ou recherche thématique
- Catégories complètes : Pentateuque, livres historiques, livres poétiques et de sagesse, prophètes majeurs et mineurs, Évangiles, Actes, épîtres de Paul, épîtres générales et Apocalypse
- QCM Gemini, vrai ou faux, retrouver la référence, compléter le verset, mode varié, révision des erreurs et entraînement adaptatif
- Recommandations personnalisées selon les livres et références faibles, les révisions espacées, les réussites récentes et le niveau observé
- Trois niveaux de difficulté et 5, 10, 20 ou 50 questions
- Défis chronométrés (15 ou 30 secondes par question)
- Correction immédiate, explication, référence et score final
- Progression locale et synchronisable : réussite, séries, objectif quotidien et résultats par livre
- Analyse sur 7, 30 ou 90 jours avec régularité, tendance et points forts/faibles
- Comparaison des modes de jeu et lancement direct d’un entraînement ciblé
- Objectifs quotidiens et hebdomadaires personnalisables, synchronisés avec le profil
- Badges de progression propres à chaque environnement
- Installation comme application sur PC ou téléphone (PWA)
- Bouton d’installation mobile permanent avec instructions Android/iPhone en solution de secours
- Lecture audio d’un verset ou d’un chapitre, avec pause et reprise
- Choix français/arabe pour le Coran selon les voix installées sur l’appareil
- Lecture et modes de jeu locaux disponibles hors connexion après le premier chargement
- Questions déjà utilisées espacées et erreurs proposées en révision
- Signalement local des questions à contrôler
- Carnet Word cumulatif, sans doublons, classé par livre, avec sommaire et corrections repliables
- Export de toutes les questions ou uniquement des erreurs
- Sélection obligatoire du carnet existant avant chaque mise à jour
- Le fichier Word reste la source principale, même après effacement du navigateur
- Interface adaptée au téléphone
- Tableau de bord complet avec activité récente, objectif quotidien et bibliothèque personnelle
- Lecteur de la Bible par livre, chapitre et verset avec navigation continue
- Passages favoris enregistrés localement
- Recherche textuelle et contextuelle préparée pour la future recherche Gemini
- Centre d’extraction disponible à tout moment avec filtres par mode, résultat, période et livre
- Carnet Word organisé par mode de jeu puis par livre
- Adaptateur de données séparé, prêt pour la synchronisation Supabase
- Espace personnel avec inscription, connexion, déconnexion et synchronisation multiappareil
- Mot de passe oublié avec lien de récupération et choix d’un nouveau mot de passe
- Repli local automatique si Supabase est indisponible ou pas encore configuré
- Assistant contextualisé pour chaque corpus, avec références vérifiables et mode de secours local
- Parcours d’étude personnalisés sur 7, 30 ou 90 jours, propres à chaque corpus
- Programme quotidien, reprise automatique de la dernière lecture et chapitres cochés
- Notes personnelles par verset, passages « à approfondir » et quiz de révision des lectures effectuées

## Activation de Supabase

1. Créer un projet Supabase.
2. Ouvrir **SQL Editor** et exécuter `supabase-schema.sql`.
3. Copier l’URL du projet et la clé **Publishable** dans `config.js`.
4. Dans **Authentication > URL Configuration**, ajouter l’adresse GitHub Pages aux URL autorisées.

La clé Publishable est conçue pour être utilisée dans le navigateur. Ne jamais placer la clé `service_role` dans ce dépôt. Les données privées sont protégées par les politiques RLS du script SQL.

## Activation de l’assistant IA

Le navigateur envoie uniquement la question et les passages présélectionnés à `POST /assistant`. La clé Gemini reste dans les secrets du Cloudflare Worker. Le Worker tient compte de l’environnement actif et ne mélange pas les corpus. Sans cette route, l’application utilise automatiquement la recherche locale et reste fonctionnelle.

Pour envoyer les liens de récupération à des utilisateurs extérieurs à l’équipe Supabase, configurer un serveur SMTP dans **Authentication > Emails**.

## Sources des textes

- Bible : Louis Segond 1910, domaine public.
- Torah : les cinq premiers livres de la Louis Segond 1910. Cette version correspond au Pentateuque français de l’application et n’est pas présentée comme le texte hébreu massorétique.
- Coran : données arabe/français issues de `quran-json` 3.1.2, sous licence CC BY-SA 4.0. Le texte arabe et la traduction sont affichés séparément.
