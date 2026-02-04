# Novatech E-commerce (Monorepo)

Projet E-commerce complet avec Backend Node.js, Boutique Client React et Panel Admin React.
Design Premium "Novatech" (Dark mode, Glassmorphism).

## Structure du Projet

- `/server`: API REST Node.js + Express + MongoDB
- `/client`: Frontend Boutique (React + Vite + Tailwind)
- `/admin-panel`: Dashboard Administration (React + Vite + Tailwind)

## Pré-requis

- Node.js (v18+)
- MongoDB (Local ou Atlas)

## Installation

1. **Cloner le projet**

2. **Configuration Backend**
    - Aller dans `/server`
    - Renommer `.env.example` (ou créer `.env`) avec :

      ```env
      PORT=5000
      MONGODB_URI=mongodb://localhost:27017/novatech
      JWT_SECRET=votre_secret_super_securise
      CLIENT_URL=http://localhost:5173
      ADMIN_URL=http://localhost:5174
      ```

    - Installer les dépendances : `npm install`
    - (Optionnel) Seeder la base de données : `node seeder.js`

3. **Configuration Client**
    - Aller dans `/client`
    - Installer : `npm install`
    - Lancer : `npm run dev` (Port 5173)

4. **Configuration Admin**
    - Aller dans `/admin-panel`
    - Installer : `npm install`
    - Lancer : `npm run dev` (Port 5174)

## Utilisation

- **API**: <http://localhost:5000>
- **Boutique**: <http://localhost:5173>
- **Admin**: <http://localhost:5174> (Login: <admin@novatech.com> / password123)

## Déploiement Gratuit

### Backend (Render / Railway)

1. Pousser le dossier `server` (ou tout le repo et configurer le root dir).
2. Ajouter les variables d'environnement (`MONGODB_URI`, etc.).
3. Commande de build : `npm install`.
4. Commande de start : `node index.js`.

### Frontends (Vercel / Netlify)

1. Connecter le repo GitHub.
2. Pour le Client : Root Directory = `client`, Build Command = `npm run build`, Output = `dist`.
3. Pour l'Admin : Root Directory = `admin-panel`, Build Command = `npm run build`, Output = `dist`.
4. **Important**: Ajouter la variable d'environnement `VITE_API_URL` pointant vers l'URL de votre backend déployé (ex: `https://mon-api-render.com/api`).

## Fonctionnalités Clés

- **Design Premium**: UI futuriste, animations fluides.
- **Commande WhatsApp**: Pas de paiement en ligne complexe, redirection vers WhatsApp avec le récapitulatif.
- **Admin Complet**: Gestion des produits, catégories, moyens de paiement (CCP, BaridiMob, USDT...).
