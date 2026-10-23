---
name: feature
description: Implement a new feature page or maintain/modify an existing one (add field, filter, action, endpoint, fix bug) in the coffee-shop frontend. Use when asked to add a page, CRUD screen, modal, table column, API call, role permission, or i18n text under src/pages.
---

# Implement & maintain features — coffee-shop-fe

Read `AGENTS.md` for the rules; this skill is the workflow. The reference implementation is
`src/pages/categories/` (list + search + filter + create/edit modal + delete confirm). Open the
closest existing feature and mirror it before writing anything new.

## 0. Decide the mode

- **New feature** → follow "Implement". 
- **Change to existing feature** → follow "Maintain". Do not restructure the feature while at it.

## Implement a new feature

Layout (exact): `src/pages/<feature>/{<Feature>Page.tsx, api/<feature>Api.ts, components/, hooks/use<Feature>.ts, types/index.ts}`.

1. **Types** (`types/index.ts`): item shape, list params (`page,size,search,sortBy,sortDirection`
   + filters), `PaginationInfo`, request/response DTOs. Responses carry `code, message, traceId`.
2. **Endpoints**: add to `ENDPOINT` in `src/constants/endpoint.ts` under a `// <Feature>` comment.
   Never inline URLs.
3. **API** (`api/<feature>Api.ts`): one async function per endpoint using the shared `api` from
   `@/api/api`; return `response.data`. For calls whose errors the UI handles itself (create/edit/delete),
   pass `suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT]`
   — otherwise the interceptor shows a notification too. Delete sends body via `{ data: params }`.
4. **Hook** (`hooks/use<Feature>.ts`): owns `params` state (with `DEFAULT_PARAMS`), `items`,
   `pagination`, `loading`, `searchLoading`, `createLoading`, `editLoading`, `deleteLoading`,
   `showEmptyModal`, and `handleSearch` / `handlePageChange` / filter handlers (reset `page: 1` on
   search/filter). Mutations: set loading → call API → `toast.success(t(...))` → refetch with current
   params; on delete of the last item of a page > 1, go to `page - 1`. In `catch`, use
   `axios.isAxiosError`, map codes via `getResponseMessage(code)`, `toast.error`, then **rethrow** for
   create/edit so the modal can set field errors.
5. **Components** (`components/`): Create/Edit modals using antd `Form`; on submit trim strings,
   `await onSubmit`, close/reset on success; on `RESPONSE_CODE.INVALID_REQUEST` map `errorDetails`
   `{field,message}` to `form.setFields`. Props: `open, onClose, onSubmit, loading`.
6. **Page** (`<Feature>Page.tsx`): named export, presentational only. Container is
   `<div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">`, title is
   `<Typography.Title level={4} className="mb-0!">`. Use `SearchInput`, `TableGrid` + `AppColumnType`,
   `useConfirmModal` for delete, `useNotifyModal` for validation/empty-search errors. Gate actions by
   role (`useAppSelector((s) => s.auth.profile?.roleName)` vs `ROLES`).
7. **Register**:
   - Route in `src/app/router.tsx` (inside the `ProtectedRoute` children).
   - Nav entry in `NAV_ITEMS` in `src/layouts/MainLayout.tsx` (+ icon, `sidebar.<feature>` label).
   - Allowed roles in `NAV_PERMISSIONS` in `src/permission/roles.ts` (key = route path).
8. **i18n**: add all strings to `src/content/vn.json` under `<feature>` (title, column names,
   placeholders, success messages, confirm text, empty search) and `sidebar.<feature>`. Reuse
   existing `common.*`, `form.*`, `table.*`, `responses.*` keys before adding new ones.
9. **Verify** (below).

## Maintain an existing feature

1. Read the whole feature folder first (page, hook, api, types, components) and `git log -- src/pages/<feature>`
   for context.
2. Edit in the layer where the change belongs, and propagate through all layers:
   - New field → `types` (item + request DTOs) → modal form → hook → page column → `vn.json` labels.
   - New filter/param → `types` list params + `DEFAULT_PARAMS` → hook handler (reset `page: 1`) → page control → `vn.json`.
   - New endpoint → `ENDPOINT` → api fn → hook handler + loading flag → page/component.
   - New role rule → gate in page/modal using `ROLES`; update `NAV_PERMISSIONS` if it affects visibility.
   - Bug fix → find root cause in the hook/api first; page stays presentational.
3. Keep existing `// eslint-disable-line react-hooks/exhaustive-deps` / `set-state-in-effect`
   comments unless you've verified the behaviour. Do not rename exports or move files unasked.
4. Removing something: delete unused `vn.json` keys, types, and `ENDPOINT` entries it leaves behind
   (grep first — keys may be shared).

## Conventions to keep

- Named exports only (no `export default` except reducers). `import type` for types. Alias `@/`.
- No hard-coded user-facing text: `const { t } = useTranslation()`.
- Formatting: `toLocaleString('vi-VN', …)` / `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Tailwind v4 utilities; `!` suffix to override antd (`mb-0!`, `text-white!`).
- Prettier: single quotes, trailing commas, 100 cols.
- Prefer shared components (`TableGrid`, `SearchInput`, `AppFormDrawer`, `useConfirmModal`,
  `useNotifyModal`, `useToast`) over ad-hoc ones. No react-query; plain axios via the feature api layer only.

## Verify (always)

```bash
npm run type-check   # required after every change
npm run lint
npm run format
```

Fix errors before reporting done. Then summarize: files touched, new `ENDPOINT`/`vn.json` keys,
roles affected, and anything you could not verify (e.g. backend contract assumed, UI not run in browser).
