# The Faces

Galerie infinie de peintures baroques naviguable en 3D.

## Stack

- React 19 + TypeScript
- Three.js + React Three Fiber
- GSAP (animations)
- Vite

## Lancer le projet

```bash
npm install
npm run dev
```

## Scripts

| Commande           | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Démarre le serveur de développement                         |
| `npm run build`    | Build de production                                         |
| `npm run download` | Télécharge les œuvres depuis l'API Art Institute of Chicago |

## Structure

```
src/
├── infinite-canvas/   # Scène Three.js (chunks, textures, caméra)
├── loader/            # Preloader animé GSAP
├── manifest.ts        # Liste des images
└── App.tsx            # Point d'entrée

scripts/
└── download-artworks.ts   # Script de téléchargement des images

public/images/         # Images WebP des œuvres
```

## Navigation

| Action             | Contrôle        |
| ------------------ | --------------- |
| Parcourir          | Glisser / WASD  |
| Zoomer             | Molette / Pinch |
| Monter / Descendre | Q / E           |
