# Guide de Déploiement : GitHub Actions & GitHub Pages

Ce projet est prêt pour un déploiement continu et automatisé sur **GitHub Pages** à l'aide de **GitHub Actions**.

---

## 🚀 Activation en 3 Étapes Rapides

### Étape 1 : Activer GitHub Pages avec GitHub Actions
1. Allez sur votre dépôt GitHub.
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans la barre latérale gauche, cliquez sur **Pages** (sous la section *Code and automation*).
4. Sous la section **Build and deployment** :
   - Pour **Source**, sélectionnez **GitHub Actions** (au lieu de *Deploy from a branch*).

---

### Étape 2 : Pousser le Code sur votre Branche Principale
Assurez-vous que les fichiers `.github/workflows/deploy.yml`, `public/404.html` et la configuration `vite.config.ts` sont bien validés dans votre Git.

Exécutez dans votre terminal :
```bash
git add .
git commit -m "feat: configurer déploiement GitHub Actions et Pages"
git push origin main
```
*(ou `git push origin master` selon le nom de votre branche principale)*.

---

### Étape 3 : Vérifier le Déploiement Automatique
1. Rendez-vous dans l'onglet **Actions** de votre dépôt GitHub.
2. Vous verrez le workflow **Deploy to GitHub Pages** se déclencher automatiquement.
3. Une fois terminé (icône verte ✅), l'URL publique de votre application s'affichera directement dans le résumé de l'exécution, sous la forme :
   ```
   https://<votre-nom-d-utilisateur>.github.io/<nom-du-depot>/
   ```

---

## 🛠️ Détails de la Configuration Technique

### 1. Workflow GitHub Actions (`.github/workflows/deploy.yml`)
- Déclenché à chaque push sur `main` ou `master`, ainsi que manuellement via **Run workflow** (`workflow_dispatch`).
- Configure Node.js 20 avec mise en cache npm (`npm ci`).
- Exécute `npm run build:pages` pour produire le bundle web statique optimisé dans `./dist`.
- Déploie le dossier `./dist` via l'action officielle GitHub `actions/deploy-pages@v4`.

### 2. Gestion des Chemins Relatifs (`vite.config.ts`)
- Le paramètre `base: process.env.VITE_BASE_PATH || './'` garantit que les scripts, styles CSS et polices se chargent correctement, que l'application soit servie à la racine (`/`) ou dans un sous-dossier de dépôt (`/nom-du-repo/`).

### 3. Support SPA & Navigation (`public/404.html`)
- Un fichier `404.html` est automatiquement copié dans `dist/` lors du build pour rediriger proprement les rechargements de page vers l'application React sans erreur 404 de GitHub.

### 4. Mode Autonome & Persistance Locale (GitHub Pages)
- Sur GitHub Pages (hébergement 100% statique), l'application s'exécute de façon autonome :
  - **Moteur d'attrition IA** : Les calculs de score d'attrition et de détection d'alertes s'exécutent directement dans le navigateur du client.
  - **Persistance LocalStorage** : Les modifications de recrues, Welcome Kits, incidents de transport, pointages école et Carré Magique sont sauvegardées dans le stockage local du navigateur.
  - **Copilote IA** : Un moteur d'analyse intégré répond instantanément aux questions opérationnelles (risques, postes goulots, Lean, recrues critiques). Une clé API Gemini peut également être renseignée optionnellement pour les requêtes en langage naturel direct.

---

## 💻 Développement Local

Pour continuer à exécuter l'application en local avec le serveur Node.js / Express complet :
```bash
npm install
npm run dev
```
L'application démarre sur `http://localhost:3000`.
