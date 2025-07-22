# 🌩️ Threads of Shayari v2 - Turborepo Monorepo

A lightning-fast fullstack monorepo powered by Turborepo, featuring:

- ⚡️ **Turborepo** — supercharged monorepo with caching and parallelization
- 🔥 **Bun** — blazing-fast package manager and runtime
- 🌩️ **Cloudflare Workers** — backend with blazing-fast edge execution
- 🧩 **Hono** — routing + type-safe API with RPC client
- ⚛️ **React + Vite** — modern frontend SPA
- 📁 **Monorepo structure** — organized workspace with shared code
- 📦 **TypeScript everywhere** — full type safety across the stack
- 🚀 **Instant deploy** with `wrangler`

---

## 📁 Folder Structure

```
.
├── api/              # Cloudflare Worker (backend, API)
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── wrangler.jsonc
├── web/              # Frontend (Vite + React SPA)
│   ├── src/
│   │   ├── App.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── index.html
│   └── package.json
├── shared/           # Shared code between frontend and backend
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── package.json      # Root scripts for fullstack workflow
├── bun.lock
└── tsconfig.json
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/yourname/yourproject.git
cd yourproject
bun install
```

## ⚡ Turborepo Commands

### Development Mode

```bash
# Start all packages in development mode
bun run dev
```

This will start:

- **Shared**: TypeScript watch mode
- **API**: Cloudflare Worker dev server at `http://127.0.0.1:8787`
- **Web**: Vite dev server at `http://localhost:5173`

### Building

```bash
# Build all packages
bun run build

# Build specific package
bunx turbo build --filter=api
```

### Other Commands

```bash
bun run type-check    # Type checking
bun run lint         # Linting
bun run clean        # Clean build artifacts
```

## 🌐 Development

Run both frontend and backend together:

```bash
bun run dev
```

This will:

- Start shared library in watch mode
- Start Cloudflare Worker via `wrangler dev`
- Start Vite dev server for the React frontend

## 🏗️ Build for Production

```bash
npm run build
```

This will:

- Build shared library
- Build backend Worker logic
- Build frontend React SPA into `web/dist`

## 🚀 Deploy to Cloudflare

```bash
npm run deploy
```

- Deploys your Worker + SPA to Cloudflare edge
- Static files served from `web/dist`
- API routes handled under `/api`

## 📦 Scripts

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `dev`          | Run shared, worker, and frontend together |
| `dev:web`      | Frontend only (Vite dev server)           |
| `dev:api`      | Worker only (Wrangler)                    |
| `dev:shared`   | Shared library in watch mode              |
| `build`        | Build shared, backend, and frontend       |
| `build:web`    | Build frontend only                       |
| `build:api`    | Build backend only                        |
| `build:shared` | Build shared library only                 |
| `deploy`       | Deploy to Cloudflare                      |
| `cf-typegen`   | Generate types for environment            |

## 🧪 Example Routes

| Route             | Type        | Description           |
| ----------------- | ----------- | --------------------- |
| `/`               | Frontend    | React SPA entry point |
| `/api/health`     | Backend API | Health check endpoint |
| `/api/auth/login` | Backend API | Sample login route    |

🔒 All `/api/*` routes are handled by your Worker (run_worker_first)

## 🧠 Features

- ✅ Full TypeScript support
- ✅ Type-safe Hono RPC client (via hc<AppType>())
- ✅ SPA fallback (index.html) for frontend routing
- ✅ Dev-first workflow with hot reloading
- ✅ Fast Cloudflare edge deployment
- ✅ Monorepo structure with shared code
- ✅ Path aliases for clean imports

## 🧰 Tools Used

- **Cloudflare Workers** — Serverless backend runtime
- **Wrangler** — CLI for Cloudflare Workers
- **Hono** — Fast, lightweight web framework
- **React** — Frontend UI library
- **Vite** — Fast build tool and dev server
- **TypeScript** — Type-safe JavaScript
- **Bun** — Fast package manager and runtime
