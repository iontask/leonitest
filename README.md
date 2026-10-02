# OnboardAI Manufacturing (90 Jours) 🏭🚀

> Plateforme digitale intelligente de pilotage et suivi d'intégration 90 jours en milieu industriel manufacturing (automobile & aéronautique).

[![Deploy to GitHub Pages](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/actions/workflows/deploy.yml)

---

## 🌟 Fonctionnalités Clés

1. **Dashboard Direction Générale & Pilotage Lean** :
   - Taux de rétention à 90 jours, score moyen de risque d'attrition, Readiness Score Welcome Kit J1, taux de réussite école et FPY Qualité.
   - Graphiques de distribution des risques et récapitulatif des alertes actives.
2. **Gestion des Recrues & Dossier Intégration** :
   - Recherche, filtrage par statut et fiche individuelle détaillée par recrue.
3. **Module 1 — Welcome Kit & Dotations J1** :
   - Émargement des 7 dotations obligatoires (Gilet, Blouse, Contrat, Badge d'accès, Casier vestiaire, Livret d'accueil, EPI).
4. **Module 2 — Logistique & Navettes de Transport Usine** :
   - Lignes de bus industrielles, horaires de ramassage, confirmation J-1 et journal d'incidents/retards.
5. **Module 3 — École Interne des Métiers (J1 à J5)** :
   - Suivi des cohortes, pointage quotidien de présence (retards/absences), examens et quiz théoriques et pratiques.
6. **Module 4 — Affectation Ligne & Hiérarchie Terrain** :
   - Rattachement Plant Manager, Segment Leader, Shift Leader, Hancho et Team Speaker.
   - Identification des postes critiques et goulots d'étranglement (Takt Time).
7. **Module 6 — Montée en Cadence & Carré Magique (ILOU)** :
   - Courbe d'apprentissage (Learning Curve) : cadence réelle vs cible et conformité FPY.
   - Niveaux de qualification : **I** (Observateur), **L** (Sous supervision), **O** (Autonome au takt), **U** (Tuteur / Formateur).
8. **Module 8 — Matrice de Polyvalence Usine** :
   - Matrice visuelle par ligne et station, validation par le Hancho référent.
9. **Module 7 — Moteur d'Attrition Prédictif IA & Alertes Automatiques** :
   - Algorithme multi-facteurs pondéré (absences précoces, retards, satisfaction, quiz, écart cadence, transport, kit).
   - Bouton de simulation BullMQ quotidien (Batch Cron).
10. **Module 5 & 11 — Enquêtes de Satisfaction (Jalons J+5, J+28, J+90)** :
    - Évaluation du climat d'accueil, du sentiment d'intégration et corrélation avec l'attrition.
11. **Module 14 — Bilan Exécutif, Audit & Copilote IA Conversationnel** :
    - Exportation des données en format CSV et vue synthétique imprimable pour les audits.
    - **Copilote IA Conversationnel (Gemini 3.8 Flash)** : conseils Lean, analyse de postes goulots et recommandations terrain.

---

## 🚀 Déploiement Automatique sur GitHub Pages

Le projet inclut un workflow **GitHub Actions** (`.github/workflows/deploy.yml`) prêt à l'emploi.

### Activation en 3 clics :
1. Sur votre dépôt GitHub, allez dans **Settings** > **Pages**.
2. Dans **Build and deployment > Source**, sélectionnez **GitHub Actions**.
3. Poussez votre code :
   ```bash
   git add .
   git commit -m "Déploiement GitHub Pages"
   git push origin main
   ```
4. Votre site sera automatiquement publié et disponible à :
   ```
   https://<votre-compte>.github.io/<nom-du-repo>/
   ```

Consultez le fichier complet [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus d'informations.

---

## 🛠️ Lancement en Local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement full-stack
npm run dev

# Tester la compilation pour GitHub Pages
npm run build:pages
```
Accès local : `http://localhost:3000`
