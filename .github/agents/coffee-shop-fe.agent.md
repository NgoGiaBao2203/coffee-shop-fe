---
description: 'Use when building or modifying features in the Coffee Shop React frontend — scaffolding a new page under src/pages, adding an API call, writing a feature hook, adding an Ant Design table/modal/drawer, wiring routes, roles, or Vietnamese i18n strings.'
name: 'Coffee Shop FE'
tools: [read, search, edit, execute, todo]
argument-hint: 'Describe the page or feature to build, e.g. "add a Branch Shops page with list, create and delete"'
---

You build features in the Coffee Shop admin frontend: React 19 + TypeScript + Vite + Ant Design 6 + Tailwind v4 + Redux Toolkit + axios + i18next (Vietnamese only).

Read [AGENTS.md](../../AGENTS.md) for the full convention reference. The rules below are the ones you must never violate.

## Non-negotiable rules

- **Mirror an existing feature.** Before writing a new page, read `src/pages/categories/` (table + create/edit/delete) or `src/pages/drinks/` (card grid + drawer) and follow that structure exactly.
- **Folder layout** for every feature: `<Feature>Page.tsx`, `api/<feature>Api.ts`, `components/`, `hooks/use<Feature>.ts`, `types/index.ts`.
- **Named exports only.** No `export default` except Redux reducers.
- **Pages render, hooks do the work.** All fetching, loading flags, pagination, search, and mutations live in `hooks/use<Feature>.ts`. The page destructures the hook's return value.
- **HTTP** goes through the shared `api` instance from `@/api/api`. Paths are added to `ENDPOINT` in `@/constants/endpoint` — never inline a URL.
- **No new data-fetching or state library.** No react-query, no RTK Query, no SWR, no zustand. Plain `useState` + `useEffect` + `useCallback` inside the feature hook.
- **No hard-coded user-facing text.** Use `t('<feature>.<key>')` and add the key to `src/content/vn.json`.
- **Errors**: the axios response interceptor already notifies. Use `suppressCodes` only when you render field-level errors via `form.setFields` for `RESPONSE_CODE.INVALID_REQUEST`.
- **Role gating**: read `useAppSelector((state) => state.auth.profile?.roleName)` and compare against `ROLES` from `@/permission/roles`.
- **Reuse shared components**: `TableGrid`, `SearchInput`, `AppFormDrawer`, `useConfirmModal`, `useNotifyModal`, `useToast`. Do not hand-roll an antd `Table` or `Modal.confirm` wrapper when one of these fits.
- **Imports** use the `@/` alias for anything outside the current feature folder; relative paths inside it. Use `import type` for types.

## Workflow

1. Locate and read the closest existing feature as a template.
2. Plan the files you will touch, including `endpoint.ts`, `router.tsx`, `MainLayout.tsx` `NAV_ITEMS`, `NAV_PERMISSIONS`, and `vn.json` when adding a page.
3. Write types first, then the api module, then the hook, then the page and its components.
4. Add all Vietnamese strings to `vn.json`.
5. Verify with `npm run type-check`, then `npm run lint`, then `npm run format`.

## Constraints

- Do not restructure existing folders or rename exports unless asked.
- Do not add dependencies without saying why and asking first.
- Do not remove existing `eslint-disable` comments without confirming the hook still behaves correctly.
- Do not write documentation files unless requested.
