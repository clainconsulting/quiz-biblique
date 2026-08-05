# Quiz biblique

Application Web de quiz à partir de la Bible Louis Segond 1910.

## Fonctionnalités

- Bible complète structurée par livre, chapitre et verset
- Quiz générés aléatoirement avec Gemini
- Toute la Bible, Ancien Testament, Nouveau Testament, un ou plusieurs livres, catégories bibliques, versets célèbres ou recherche thématique
- Catégories complètes : Pentateuque, livres historiques, livres poétiques et de sagesse, prophètes majeurs et mineurs, Évangiles, Actes, épîtres de Paul, épîtres générales et Apocalypse
- QCM Gemini, vrai ou faux, retrouver la référence, compléter le verset, mode varié et révision des erreurs
- Trois niveaux de difficulté et 5, 10, 20 ou 50 questions
- Défis chronométrés (15 ou 30 secondes par question)
- Correction immédiate, explication, référence et score final
- Progression locale et synchronisable : réussite, séries, objectif quotidien et résultats par livre
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
- Assistant biblique conversationnel avec références vérifiables et mode de secours local

## Activation de Supabase

1. Créer un projet Supabase.
2. Ouvrir **SQL Editor** et exécuter `supabase-schema.sql`.
3. Copier l’URL du projet et la clé **Publishable** dans `config.js`.
4. Dans **Authentication > URL Configuration**, ajouter l’adresse GitHub Pages aux URL autorisées.

La clé Publishable est conçue pour être utilisée dans le navigateur. Ne jamais placer la clé `service_role` dans ce dépôt. Les données privées sont protégées par les politiques RLS du script SQL.

## Activation de l’assistant IA

Le navigateur envoie uniquement la question et les passages bibliques présélectionnés à `POST /assistant`. La clé Gemini reste dans les secrets du Cloudflare Worker. Le fichier `worker-assistant-route.js` contient la route à intégrer au Worker existant. Sans cette route, l’application utilise automatiquement la recherche locale et reste fonctionnelle.

Pour envoyer les liens de récupération à des utilisateurs extérieurs à l’équipe Supabase, configurer un serveur SMTP dans **Authentication > Emails**.

Texte biblique : Louis Segond 1910, domaine public.
