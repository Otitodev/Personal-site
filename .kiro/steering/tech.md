# Technology Stack

## Core Framework
- **Astro 5.14.4**: Static site generator with component islands architecture
- **TypeScript**: Strict type checking enabled via `astro/tsconfigs/strict`
- **TailwindCSS 4.1.12**: Utility-first CSS framework with Vite plugin integration

## UI & Styling
- **Shadcn/ui**: Component system configured with New York style
- **Class Variance Authority**: Type-safe component variants
- **Tailwind Merge & clsx**: Conditional class merging utilities
- **Lucide React**: Icon library for consistent iconography
- **Custom Fonts**: Gabarito (variable) and Be Vietnam Pro

## Development Tools
- **Prettier**: Code formatting with Astro and TailwindCSS plugins
- **Astro Check**: Built-in type checking and validation
- **tw-animate-css**: Animation utilities for TailwindCSS

## Build System & Commands

### Development
```bash
npm run dev        # Start development server at localhost:4321
npm run start      # Alias for dev command
```

### Production
```bash
npm run build      # Type check + build for production
npm run preview    # Preview production build locally
```

### Type Checking
```bash
npm run astro      # Direct Astro CLI access
astro check        # Manual type checking
```

## Path Aliases
- `@/*` → `./src/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@icons/*` → `src/icons/*`
- `@lib/*` → `src/lib/*`
- `@types` → `src/types/index.ts`
- `@config` → `src/config/index.ts`

## Content Collections
- Zod-based schema validation for frontmatter
- Type-safe content queries and rendering
- Automatic date parsing and validation