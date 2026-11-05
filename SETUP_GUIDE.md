# Guide de démarrage du projet The Box

Ce fichier explique comment démarrer les services du projet, quelles commandes lancer, et comment accéder aux différents éléments du projet.

---

## 1. Prérequis

Avant de lancer le projet, vérifie que :

- Docker Desktop est installé et démarré
- Node.js est installé
- npm est installé
- le projet a bien été cloné

---

## 2. Démarrer la base de données

Depuis le dossier racine du projet :

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box"
docker compose up -d postgres
```

Cette commande démarre le conteneur PostgreSQL défini dans `docker-compose.yml`.

### Vérification

```bash
docker compose ps
```

Tu dois voir le conteneur `the_box` ou un service PostgreSQL en état `running`.

---

## 3. Démarrer l’API NestJS

Ouvre un terminal puis lance :

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box\apps\api"
npm install
npm run start:dev
```

L’API sera accessible sur :

```text
http://localhost:3000
```

---

## 4. Démarrer le frontend Vite/React

Dans un autre terminal :

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box\apps\web"
npm install
npm run dev
```

Le frontend sera accessible sur :

```text
http://localhost:5173
```

---

## 5. Voir la base de données

Depuis le dossier API :

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box\apps\api"
npx prisma studio
```

Puis ouvre dans le navigateur :

```text
http://localhost:5555
```

Tu pourras visualiser les tables et les données de la base PostgreSQL.

---

## 6. Résumé des ports utilisés

| Service       | URL            | Description              |
| ------------- | -------------- | ------------------------ |
| PostgreSQL    | localhost:5433 | Base de données          |
| API NestJS    | localhost:3000 | Backend                  |
| Frontend Vite | localhost:5173 | Interface utilisateur    |
| Prisma Studio | localhost:5555 | Visualisation de la base |

---

## 7. Commandes de démarrage rapide

### Démarrer tout le projet

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box"
docker compose up -d postgres
cd apps\api
npm run start:dev
```

Dans un second terminal :

```bash
cd "c:\Users\DELL 5450\Desktop\CILICONE-VALLEY\the_box\apps\web"
npm run dev
```

---

## 8. Commandes utiles

### Arrêter les conteneurs

```bash
docker compose down
```

### Redémarrer la base

```bash
docker compose restart postgres
```

### Voir les logs Docker

```bash
docker compose logs -f
```

---

## 9. Problèmes fréquents

### Docker ne répond pas

- Vérifie que Docker Desktop est bien démarré
- Relance Docker Desktop
- Réessaie la commande `docker compose up -d postgres`

### L’API ne démarre pas

- Vérifie que les dépendances sont installées : `npm install`
- Vérifie qu’il n’y a pas d’erreur dans le terminal
- Vérifie la configuration de la base dans le fichier `.env`

### Le frontend ne s’ouvre pas

- Vérifie que la commande `npm run dev` est en cours
- Ouvre `http://localhost:5173`
- Vérifie qu’aucun autre service n’utilise déjà ce port

---

## 10. Récapitulatif du routing / services

- Base de données PostgreSQL : conteneur Docker, port `5433`
- API backend NestJS : port `3000`
- Frontend React/Vite : port `5173`
- Prisma Studio : port `5555`

Tu peux utiliser ce document comme référence pour démarrer et vérifier rapidement l’application.
