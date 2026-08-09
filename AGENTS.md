# Coffee Shop Frontend — Agent Guide

React 19 + TypeScript + Vite admin app for a coffee shop management system.

## Stack

| Concern | Choice |
|---|---|
| UI | Ant Design 6 (`antd`, `@ant-design/icons`) |
| Styling | Tailwind CSS v4 utilities + `style` prop for one-offs |
| State | Redux Toolkit + `redux-persist` (auth only) |
| Data fetching | Plain `axios` inside feature hooks — **no** react-query / RTK Query |
| Routing | React Router v7, hash router |
| i18n | i18next, single locale `vn`, all text in `src/content/vn.json` |
| Format | Prettier (single quotes, trailing commas, 100 cols) |

Import alias: `@/` → `src/`.

## Commands

```bash
npm run dev         # type-check + vite dev
npm run type-check  # tsc -b --noEmit
npm run lint        # eslint .
npm run format      # prettier --write "src/**/*.{ts,tsx,css}"
npm run build:prod
```

Always run `npm run type-check` after making changes.

## Feature Folder Convention

Every page lives in `src/pages/<feature>/` with this exact layout:

```
pages/<feature>/
├── <Feature>Page.tsx      # named export, e.g. export function CategoriesPage()
├── api/<feature>Api.ts    # one async function per endpoint
├── components/            # page-scoped components (modals, cards, filters)
├── hooks/use<Feature>.ts  # all state, fetching, loading flags, handlers
├── styles/                # optional page-scoped CSS
└── types/index.ts         # request/response DTOs, list params, item shapes
```

Rules:
- **Named exports only** for components and hooks — no `export default` except Redux reducers.
- Pages are presentational: they render Ant Design components and delegate every side effect to the feature hook.
- Hooks own `loading`, `searchLoading`, `createLoading`, `editLoading`, `deleteLoading`, `pagination`, `showEmptyModal`, and the `handle*` callbacks. The page destructures them.
- Types are declared in `types/index.ts` and imported with `import type`.

## API Layer

- Use the shared `api` instance from [src/api/api.ts](src/api/api.ts). Never call `axios` directly for app endpoints.
- Add the path to `ENDPOINT` in [src/constants/endpoint.ts](src/constants/endpoint.ts); never inline URL strings.
- The response interceptor already shows an Ant Design error notification for failures. Pass `suppressCodes: [...]` in the request config when the call site renders field-level errors instead.
- The request interceptor attaches `X-User-Id` from the persisted profile automatically.

```ts
export async function getCategoriesApi(params: CategoryListParams): Promise<CategoryListResponse> {
  const response = await api.get<CategoryListResponse>(ENDPOINT.GET_CATEGORIES, { params });
  return response.data;
}
```

## Error Handling

- Backend codes live in `RESPONSE_CODE` ([src/constants/messages.ts](src/constants/messages.ts)).
- Translate a code with `getResponseMessage(code)` ([src/utils/getResponseMessage.ts](src/utils/getResponseMessage.ts)).
- `RESPONSE_CODE.INVALID_REQUEST` returns `errorDetails: { field, message }[]` — map them onto the Ant Design form with `form.setFields`.
- A 401 clears the persisted profile.

## Text & i18n

- No hard-coded user-facing strings. Use `const { t } = useTranslation()` and `t('<feature>.<key>')`.
- Add every new key to [src/content/vn.json](src/content/vn.json) under the feature namespace.

## Permissions

- Roles come from `ROLES` in [src/permission/roles.ts](src/permission/roles.ts) (Vietnamese labels).
- Read the current role via `useAppSelector((state) => state.auth.profile?.roleName)` and gate action buttons.
- Sidebar visibility is driven by `NAV_PERMISSIONS` + `useNavItems`.

## Shared Components

Prefer these over ad-hoc implementations:

| Component | Path |
|---|---|
| `TableGrid`, `AppColumnType` | [src/components/table/TableGrid.tsx](src/components/table/TableGrid.tsx) |
| `SearchInput` | [src/components/search/SearchInput.tsx](src/components/search/SearchInput.tsx) |
| `AppFormDrawer`, `FormFieldConfig` | [src/components/form/AppFormDrawer.tsx](src/components/form/AppFormDrawer.tsx) |
| `useConfirmModal` | [src/components/modal/ConfirmModal.tsx](src/components/modal/ConfirmModal.tsx) |
| `useNotifyModal` | [src/components/modal/NotifyModal.tsx](src/components/modal/NotifyModal.tsx) |
| `useToast` | [src/components/toast/useToast.ts](src/components/toast/useToast.ts) |

## Adding a New Page

1. Create `src/pages/<feature>/` with the folder layout above.
2. Add endpoints to `ENDPOINT`.
3. Register the route in [src/app/router.tsx](src/app/router.tsx) under `ProtectedRoute`.
4. Add the nav entry in `NAV_ITEMS` ([src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx)) and its role list in `NAV_PERMISSIONS`.
5. Add Vietnamese strings to `vn.json`.
6. Run `npm run type-check` and `npm run format`.

## Conventions to Preserve

- Vietnamese number/date formatting: `toLocaleString('vi-VN', ...)`, `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Page container: `<div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">`.
- Tailwind `!` important suffix is used to override antd styles (`mb-0!`, `text-white!`).
- Existing `// eslint-disable-line react-hooks/exhaustive-deps` comments are intentional — don't strip them without checking behaviour.
