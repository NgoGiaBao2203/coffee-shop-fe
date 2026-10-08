---
name: coffee-shop-feature-impl
description: 'Implement a new feature page in coffee-shop-fe following the project convention. Use when adding a new page, feature endpoint, or admin panel section to the React app. Covers folder structure, API layer, components, hooks, types, and i18n registration.'
argument-hint: 'Feature name (e.g., "Branch Shops", "Orders")'
---

# Coffee Shop Feature Implementation

## When to Use

- Adding a new page/section to the admin app
- Implementing a new REST endpoint with full CRUD UI
- Extending the sidebar navigation with a new feature
- Creating modals, drawers, or feature-scoped components

## Feature Folder Convention

Every feature lives in `src/pages/<feature>/` with this exact layout:

```
pages/<feature>/
├── <Feature>Page.tsx         # Named export, e.g. export function CategoriesPage()
├── api/<feature>Api.ts       # Async functions per endpoint
├── components/               # Page-scoped components (modals, cards, filters)
├── hooks/use<Feature>.ts     # State, fetching, handlers
├── styles/                   # Optional CSS
└── types/index.ts            # Request/response DTOs
```

## Quick Checklist

### 1. Create Folder Structure
- [ ] Create `src/pages/<feature>/` directory
- [ ] Create subdirectories: `api/`, `components/`, `hooks/`, `types/`
- [ ] Use PascalCase for feature name (e.g., `categories/`, `drinks/`)

### 2. Define Types (`types/index.ts`)
- [ ] Declare `<Feature>Item` interface (single entity shape)
- [ ] Declare `<Feature>ListParams` interface (filter/pagination params)
- [ ] Declare `<Feature>ListResponse` interface (API response)
- [ ] Export type, not export default

### 3. Create API Layer (`api/<feature>Api.ts`)
- [ ] Import shared `api` instance from `src/api/api.ts`
- [ ] Add endpoint to `ENDPOINT` in `src/constants/endpoint.ts`
- [ ] Create async functions: `get<Feature>sApi()`, `create<Feature>Api()`, `edit<Feature>Api()`, `delete<Feature>Api()`
- [ ] Type params with feature types, return type with API response
- [ ] Never call `axios` directly
- [ ] Pass `suppressCodes: [...]` for field-level error handling if needed

### 4. Create Feature Hook (`hooks/use<Feature>.ts`)
- [ ] State: `items`, `pagination`, `loading`, `searchLoading`, `createLoading`, `editLoading`, `deleteLoading`
- [ ] State: `showEmptyModal`, `selectedItem`
- [ ] Handlers: `handleSearch()`, `handleCreate()`, `handleEdit()`, `handleDelete()`, `handlePaginationChange()`
- [ ] Call API functions from step 3
- [ ] Handle error: use `getResponseMessage(errorCode)` for notification
- [ ] Handle `RESPONSE_CODE.INVALID_REQUEST` with `form.setFields()`
- [ ] Export named, not default

### 5. Create Page Component (`<Feature>Page.tsx`)
- [ ] Presentational only—delegate side effects to the hook
- [ ] Import hook: `const { items, loading, ... } = use<Feature>()`
- [ ] Render: `<TableGrid>` with columns, `<SearchInput>`, pagination
- [ ] Action buttons gate by role: `useAppSelector(state => state.auth.profile?.roleName)`
- [ ] Pass modals/drawers as components
- [ ] Use container style: `className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm"`
- [ ] Export named: `export function <Feature>Page()`

### 6. Create Modals/Drawers (`components/<Feature>*Modal.tsx`)
- [ ] Use `<AppFormDrawer>` or `<AppModal>` from shared components
- [ ] Declare `FormFieldConfig[]` for form fields
- [ ] Import feature types
- [ ] Handle submit → call hook handler
- [ ] On success → close modal + refresh parent
- [ ] Export named, not default

### 7. Add Endpoints
- [ ] Open `src/constants/endpoint.ts`
- [ ] Add paths: `GET_<FEATURES>`, `POST_<FEATURE>`, `PUT_<FEATURE>`, `DELETE_<FEATURE>`
- [ ] Use uppercase snake_case keys

### 8. Register Route
- [ ] Open `src/app/router.tsx`
- [ ] Add route under `ProtectedRoute`: `{ path: '/<feature>', element: <FeaturePage /> }`
- [ ] Import component

### 9. Add Navigation Entry
- [ ] Open `src/layouts/MainLayout.tsx`
- [ ] Add to `NAV_ITEMS`: `{ label: t('nav.<feature>'), path: '/<feature>', icon: <IconComponent /> }`
- [ ] Add to `NAV_PERMISSIONS`: Map `<feature>` to required roles

### 10. Add i18n Strings
- [ ] Open `src/content/vn.json`
- [ ] Add feature namespace: `"<feature>": { "title": "...", "search": "...", "create": "...", ... }`
- [ ] Use `const { t } = useTranslation()` and call `t('<feature>.<key>')` in components
- [ ] Vietnamese formatting: `toLocaleString('vi-VN', ...)`, currency with `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`

### 11. Format & Validate
- [ ] Run `npm run type-check` — all files must pass TypeScript
- [ ] Run `npm run format` — Prettier (single quotes, trailing commas, 100 cols)
- [ ] Run `npm run lint` — ESLint (keep existing `// eslint-disable-line` comments)
- ℹ️ **Unit tests**: Not implemented here — tests are handled separately by humans

## Key Rules

✅ **DO**:
- Use named exports for components and hooks (never `export default`)
- Type all API params and responses with DTOs in `types/index.ts`
- Import shared components: `TableGrid`, `SearchInput`, `AppFormDrawer`, `useConfirmModal`, `useToast`
- Gate action buttons by role from Redux state
- Use `ENDPOINT` constants — never inline URLs
- Use i18n keys from `vn.json` — no hard-coded strings

❌ **DON'T**:
- Call `axios` directly (use `src/api/api.ts`)
- Use `export default` (use named exports)
- Inline endpoint URLs
- Hard-code user-facing text
- Put all logic in the page component (use hooks)
- Implement unit tests (tests are handled separately by humans)

## Example Invocation

✨ Try: "Add a Branch Shops page with list, create, edit, and delete"

## Related Skills

- Coffee Shop Backend: Define API contracts before feature implementation
- Redux State Management: When features need app-wide state (e.g., auth)
