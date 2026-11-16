# Maxime Joppin · Système solaire

Portfolio interactif en 3D : le Soleil est mon profil, chaque planète est un projet, chaque satellite une technologie.

## Lancer en local

Les modules JavaScript ne fonctionnent pas en ouvrant `index.html` directement (`file://`). Servez le dossier, par exemple :

- VS Code : extension **Live Server**, clic droit sur `index.html` → *Open with Live Server*
- ou `npx serve .` / `python -m http.server`

## Structure

```
index.html        page unique
css/styles.css    styles (accueil, HUD, fiches, responsive)
js/data.js        ← toutes les données : profil, projets, compétences, badges
js/app.js         interface : accueil, fiches, clavier, son
js/scene.js       système solaire 3D (Soleil, planètes, satellites, caméra)
js/cosmos.js      décor : galaxies, Voie lactée, comète, pulsar, étoiles filantes
js/textures.js    textures procédurales des planètes
js/panels.js      contenu des fiches
js/three.js       chargement de Three.js 0.180
```

## Ajouter un projet

Dans `js/data.js`, copiez un objet du tableau `projects` et changez son `id`, ses textes et son bloc `planet` (`type` : `terran`, `gas`, `lava`, `ice` ou `desert`, plus `radius`, `orbit`, `colors`, `rings`). La planète, son orbite, ses satellites, son entrée dans le HUD et sa fiche se créent automatiquement.

Pour une capture d’écran : déposez l’image dans `images/` et mettez `image: "images/mon-projet.jpg"`.
