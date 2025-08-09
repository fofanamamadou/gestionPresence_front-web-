# FLI Frontend - Gestion des Présences

Ce projet est le frontend de l'application de gestion des présences FLI. Il s'agit d'une application web développée en React, conçue pour offrir une interface intuitive et réactive pour la gestion des étudiants, des horaires, et du suivi des présences.

## Caractéristiques Principales

*   **Tableau de Bord (Dashboard)**: Visualisation des données clés avec des graphiques et des statistiques en temps réel.
*   **Gestion des Présences**: Suivi détaillé des absences et des retards des étudiants.
*   **Pointage par Reconnaissance Faciale**: Une fonctionnalité innovante permettant aux utilisateurs de pointer via la reconnaissance faciale pour une sécurité et une efficacité accrues.
*   **Gestion de la Structure Académique**: Modules complets pour gérer les filières, les classes, et les matières.
*   **Gestion des Horaires et Planning**: Outils pour créer et visualiser les emplois du temps.
*   **Gestion des Utilisateurs**: Interface pour l'administration des comptes utilisateurs (étudiants, professeurs, administrateurs).
*   **Authentification Sécurisée**: Système de connexion basé sur des tokens (JWT) avec des routes protégées pour sécuriser l'accès aux données.
*   **Interface Administrateur**: Une section dédiée pour les tâches d'administration de haut niveau.

## Technologies Utilisées

*   **Framework**: [React](https://reactjs.org/)
*   **Bibliothèques UI**:
    *   [Material-UI](https://mui.com/)
    *   [Ant Design](https://ant.design/)
    *   [Framer Motion](https://www.framer.com/motion/) pour les animations.
*   **Routage**: [React Router](https://reactrouter.com/)
*   **Gestion d'état**: React Context
*   **Communication API**: [Axios](https://axios-http.com/)
*   **Graphiques et Visualisation**: [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/)
*   **Reconnaissance Faciale**: [face-api.js](https://github.com/justadudewhohacks/face-api.js/)
*   **Utilitaires**: [Moment.js](https://momentjs.com/), [React Big Calendar](https://github.com/jquense/react-big-calendar)

## Installation et Lancement

Pour lancer le projet en local, suivez ces étapes :

1.  **Cloner le dépôt**
    ```bash
    git clone [URL_DU_DEPOT]
    cd FLIFrontend
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement**
    ```bash
    npm start
    ```
    L'application sera alors accessible à l'adresse `http://localhost:3000`.

    **Note importante**: Cette application est un frontend. Assurez-vous que le serveur backend du projet est également en cours d'exécution et que l'URL de l'API est correctement configurée (probablement dans `src/AxiosInstance/axiosInstance.js` ou `src/config/config.js`).

## Scripts Disponibles

Dans le répertoire du projet, vous pouvez exécuter :

*   `npm start`: Lance l'application en mode développement.
*   `npm run build`: Construit l'application pour la production dans le dossier `build`.
*   `npm test`: Lance le runner de test en mode interactif.
*   `npm run eject`: Éjecte la configuration de Create React App (opération irréversible).

## Structure du Projet

Le code source est organisé par fonctionnalité dans le dossier `src/`, ce qui facilite la maintenance et le développement.

```
src/
├── AbsenceRetard/   # Module de gestion des absences/retards
├── Admin/           # Module d'administration
├── AxiosInstance/   # Configuration centralisée d'Axios
├── Classe/          # Module de gestion des classes
├── components/      # Composants React réutilisables
├── contexts/        # Contextes React (ex: AuthContext)
├── Dashboard/       # Page du tableau de bord
├── FaceRecognition/ # Logique pour la reconnaissance faciale
├── Filiere/         # Module de gestion des filières
├── Header/          # Composant Header
├── Horaire/         # Module de gestion des horaires
├── Login/           # Page de connexion
├── Module/          # Module de gestion des matières
├── Planning/        # Module de gestion du planning
├── Pointage/        # Module de pointage
├── services/        # Logique métier et appels API (ex: authService)
├── sidebar/         # Composant Sidebar
└── utilisateur/     # Module de gestion des utilisateurs
```