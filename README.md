# Coffee Shop — Frontend

React + TypeScript + Vite application for the Coffee Shop management system.

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite |
| UI Components | Ant Design 6 |
| Styling | Tailwind CSS v4 |
| State Management | Redux Toolkit + React Redux |
| Routing | React Router v7 (Hash Router) |
| HTTP Client | Axios |
| Internationalisation | i18next + react-i18next |
| Formatter | Prettier |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (type-check → dev server)
npm run dev
```

---

## Scripts Folder (`scripts/`)

Shell scripts for CI and local workflows. All scripts must be run from the project root.

```bash
# Type-check + build for development (.env.development)
./scripts/build-dev.sh

# Type-check + build for production (.env.production)
./scripts/build-prod.sh

# Format all source files with Prettier
./scripts/format.sh
```

---

## NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Type-check → start Vite dev server (uses `.env.development`) |
| `npm run prod` | Type-check → start Vite with production mode |
| `npm run build:dev` | Type-check → build for development |
| `npm run build:prod` | Type-check → build for production |
| `npm run type-check` | TypeScript check only, no emit |
| `npm run preview` | Serve the last build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format `src/**/*.{ts,tsx,css}` with Prettier |

---

## Project Structure

```
src/
├── App.tsx                         # Root component — mounts AppProvider
├── main.tsx                        # Entry point — renders App, loads i18n
│
├── app/                            # Application bootstrap
│   ├── AppProvider.tsx             # Composes Redux, Ant Design App, AuthProvider, Router
│   ├── AuthProvider.tsx            # Authentication React context + useAuth hook
│   ├── ProtectedRoute.tsx          # Guards routes — bypasses auth when ENABLE_MOCK=true
│   └── router.tsx                  # Hash-based route definitions
│
├── api/
│   └── api.ts                      # Axios instance + request/response interceptors
│
├── components/                     # Shared reusable components
│   ├── modal/
│   │   ├── AppModal.tsx            # General-purpose modal wrapper
│   │   └── ConfirmModal.tsx        # Confirm/cancel dialog
│   ├── side-bar/
│   │   └── SideBar.tsx             # Collapsible navigation sidebar
│   └── toast/
│       └── useToast.ts             # Notification hook (success/error/warning/info)
│
├── configs/
│   └── i18n.ts                     # i18next configuration — fixed to Vietnamese (vn)
│
├── constants/
│   ├── evn.ts                      # Typed ENV variables (VITE_API_HOST, VITE_ENABLE_MOCK)
│   └── messages.ts                 # RESPONSE_CODE enum matching backend ResponseCode
│
├── content/
│   └── vn.json                     # All app text — UI labels, toasts, backend error messages
│
├── layouts/
│   ├── AuthLayout.tsx              # Centered card layout for login page
│   └── MainLayout.tsx              # App shell — sticky header + sidebar + content + footer
│
├── pages/                          # Feature pages (one folder per page)
│   └── login/
│       ├── LoginPage.tsx           # Page component
│       ├── api/loginApi.ts         # API call — POST /auth/login
│       ├── components/LoginForm.tsx# Login form (Ant Design Form)
│       ├── hooks/useLogin.ts       # Login state, toast, navigation
│       ├── styles/login.css        # Page-scoped styles
│       └── types/index.ts          # LoginRequest / LoginResponse DTOs
│
├── store/                          # Redux store
│   ├── store.ts                    # configureStore
│   ├── authSlice.ts                # userId state — setUserId / clearUserId
│   └── hooks.ts                    # useAppDispatch / useAppSelector (typed)
│
├── styles/
│   └── global.css                  # Global styles + Tailwind import
│
└── utils/
    └── getResponseMessage.ts       # Maps backend code → Vietnamese message via i18n
```

---

## Adding a New Page

1. Create a feature folder under `src/pages/<page-name>/` with this structure:
```
pages/<page-name>/
├── <PageName>.tsx        # Page component
├── api/                  # API calls
├── components/           # Page-specific components
├── hooks/                # Page-specific hooks
├── styles/               # Page-scoped CSS
└── types/                # DTOs / interfaces
```

2. Add the route to `src/app/router.tsx` inside the `ProtectedRoute` children.

3. Add a sidebar entry to `NAV_ITEMS` in `src/layouts/MainLayout.tsx`.

4. Add Vietnamese labels to `src/content/vn.json`.

---

## Environment Variables

| Variable | Development | Production |
|---|---|---|
| `VITE_API_HOST` | `http://localhost:8080` | Production API URL |
| `VITE_ENABLE_MOCK` | `true` — bypasses auth | `false` — login required |

- Edit `.env.development` for local development values.
- Edit `.env.production` for production values.

---

## Content & Messages

All display text lives in `src/content/vn.json` organised by section:

```json
{
  "common":    { ... },   // Shared labels
  "sidebar":   { ... },   // Navigation menu items
  "login":     { ... },   // Login page text and toasts
  "responses": { ... }    // Backend response code → Vietnamese message
}
```

To add new text: add the key to `vn.json` and use `t('section.key')` in the component.

---

## Authentication Flow

1. User submits login form → `POST /auth/login`
2. Server returns `userId` + sets `X-User-Id` response header
3. Axios interceptor dispatches `setUserId` to Redux store
4. Every subsequent request reads `userId` from Redux and attaches `X-User-Id` header
5. On `401` → Redux clears `userId` → `ProtectedRoute` redirects to `/login`

