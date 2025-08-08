## Flashbang Theme Toggle

Um theme-toggle open source que faz barulho de flashbang quando você sai do modo escuro. Componentinho bem humorado e zero burocracia.

### Rodando localmente

```bash
yarn
yarn dev
```

Abra `http://localhost:3000`.

### Como funciona
- Alternância por classe `.dark` aplicada em `html`.
- Estado do tema persistido em `localStorage` (`flashbang-theme`).
- Ao ir de dark -> light, toca `public/sounds/flashbang.mp3`.
- Ícone em `public/svgs/flashbang-icon.svg`.

### Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4

Contribuições são bem-vindas!
