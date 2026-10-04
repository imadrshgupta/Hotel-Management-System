# HMS Frontend (`apps/web`)

Production-oriented React + TypeScript frontend for the Hotel Management System.
Consumes the real backend APIs in `apps/api` — no mock data, no fake success.

## Stack

React 19 · TypeScript · Vite · React Router 7 · TanStack Query 5 · Axios ·
Zustand · Tailwind CSS 4 · lucide-react · Vitest + Testing Library

## Getting started

```bash
# From the repo root — installs all workspaces
npm install

# Run API + web together (API on :3000, web on :5173)
npm run dev

# Or separately
npm run start:api
npm run start:web
```

The Vite dev server proxies `/api` to `http://localhost:3000`. Copy
`.env.example` → `.env` only if you need to override the defaults.

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b + vite build
npm run lint       # oxlint
npm run test       # vitest run (jsdom)
npm run test:watch # vitest watch
```

## Environment variables

| Variable        | Default                | Description                                  |
| --------------- | ---------------------- | -------------------------------------------- |
| `VITE_API_URL`  | `/api/v1` (proxied)    | Base URL for REST API calls                  |
| `VITE_WS_URL`   | `ws://localhost:3000`  | WebSocket endpoint for real-time events      |

## Architecture

```
src/
├── app/            # App root, providers, query client
├── components/
│   ├── layout/     # Sidebar, Topbar, GlobalSearch
│   └── ui/         # Unified design system (Button, DataTable, Modal, …)
├── features/       # One folder per domain (auth, billing, reservations, …)
├── hooks/          # useAuth, useDebounce, useRealtimeInvalidate, useRooms, …
├── layouts/        # AppLayout, AuthLayout, ErrorLayout
├── lib/            # query-client, websocket client, utils
├── routes/         # Lazy-loaded route table, ProtectedRoute
├── services/       # All Axios calls — never call Axios in components
├── store/          # Zustand stores (auth, app)
└── types/          # Shared API types
```

**Data rules**

- All server state goes through TanStack Query hooks in `hooks/` backed by
  `services/api.ts`. Components never call Axios directly.
- Real-time updates arrive over the WebSocket (`lib/websocket.ts`) and are
  wired via `useRealtimeInvalidate({ "event": [["queryKey"]], ... })` which
  invalidates matching queries — no full page reloads.
- Forms use the design-system inputs (`FormField`, `CurrencyInput`, …) and
  only show success after the backend confirms the mutation.
- Destructive actions always go through `ConfirmDialog`.

## Module ↔ backend dependency matrix

The frontend only renders what the backend can actually serve. Where an API
does not exist yet, the screen shows a documented dependency notice
(`BackendDependencyNotice`) instead of mock data.

| Module | Backend routes | Status |
| ------ | -------------- | ------ |
| Auth (login, refresh, profile, password) | `POST /auth/*`, `GET /auth/profile` | ✅ Live |
| Dashboard (KPIs, arrivals, departures) | `GET /reports/*`, `GET /rooms/status-summary` | ✅ Live |
| Front office (arrivals, departures, in-house, walk-in, check-in/out) | `GET /reports/*`, `GET/POST /stays/*`, `POST /reservations` | ✅ Live |
| Room board | `GET /rooms`, `PATCH /rooms/:id/status` | ✅ Live |
| Reservations (list, create, confirm, cancel, no-show) | `GET/POST /reservations*` | ✅ Live |
| Availability calendar | `GET /availability/rooms` | ✅ Live |
| Guests | `GET/POST/PATCH /guests*` | ✅ Live |
| Billing — Folio (charges, add/remove item) | `GET /folios/stay/:id`, `POST/DELETE /folios/:id/items` | ✅ Live |
| Billing — Payments (record, refund) | `POST /payments`, `POST /payments/:id/refund` | ✅ Live |
| Billing — Invoices (list, finalize, void) | `GET /invoices`, `POST /invoices/:id/finalize`, `…/void` | ✅ Live |
| Housekeeping board | `GET /housekeeping`, `POST /housekeeping/:id/{start,complete,inspect}` | ✅ Live |
| POS orders + post-to-room | `GET/POST /pos`, `POST /pos/:id/post-to-room` | ✅ Live |
| Reports | `GET /reports/{arrivals,departures,in-house,room-status,daily-revenue,occupancy,payments,outstanding}` | ✅ Live |
| Settings — property | `GET/PATCH /properties` | ✅ Live |
| Settings — users | `GET/POST/PATCH/DELETE /users` | ✅ Live |
| Settings — rooms | `GET/POST/PATCH/DELETE /rooms` | ✅ Live |
| Settings — room types | `GET/POST/PATCH/DELETE /room-types` | ✅ Live |
| Settings — floors | `GET/POST/PATCH/DELETE /floors` | ✅ Live |
| POS tables / menu / KOT status flow | — | 🚧 Documented dependency |
| Maintenance tickets | — | 🚧 Documented dependency |
| Inventory (items, stock, vendors, POs, receipts) | — | 🚧 Documented dependency |
| Banquet | — | 🚧 Documented dependency |
| Loyalty / membership | — | 🚧 Documented dependency |
| Settings — taxes, discounts, rate plans, payment methods | — | 🚧 Documented dependency |

### WebSocket events

The backend broadcasts to the property room at `ws://…/ws?token=…&property_id=…`:

`room:status_changed` · `reservation:created|confirmed|cancelled|no_show` ·
`stay:checked_in|checked_out` · `payment:created` · `order:created|posted_to_room` ·
`housekeeping:assigned`

## Testing

```bash
npm test
```

Covers formatting utils, design-system components, the auth store permission
logic, the debounce hook, and real-time invalidation (mock WebSocket → query
refetch on event).