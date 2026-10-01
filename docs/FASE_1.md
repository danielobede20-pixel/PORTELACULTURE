# Portela Culture — Fase 1

Preserve the original catalog, photos, brand opening, navigation, animations and filters. No prices, stock promises, CRM, IA or Phase 2 automation are introduced.

## Conversion flow

`public/catalogo.js` renders the existing 350-product catalog and gallery. `conversao-core.js` formats product, category and generic WhatsApp messages. `conversao.js` owns the optional three-step quiz, links and interest submissions. Product details retain optional size and city fields, sent only in the WhatsApp draft. The single product contact action stays visible while scrolling the detail dialog.

## Durable interest records

`POST /api/interesses` records a quiz completion or WhatsApp link activation, using D1 `DB` and the generated Drizzle migration. Data includes server time, temporary visit UUID, detectable origin, sanitized entry/current page, CTA placement, server-verified product identity, category, quiz answers, click flag, intent and initial `novo` status. Product metadata comes from `worker/catalog.json`, derived from the unchanged catalog.

There is no public read endpoint. Website visitors can neither list records nor edit statuses. Owner inspection uses the Sites database viewer. Browser session storage contains only temporary visit context; D1 remains the authoritative record store. The client retains failed submissions in memory for explicit retry while the page stays open and does not block WhatsApp. Repeated event IDs are idempotent. Each session can create at most 30 records per hour; this is a basic per-session bound, not a distributed abuse prevention system.

A click records intent to open WhatsApp, not an actual sent message, sale, identity or phone number. Instagram attribution uses recognizable referrer/UTM source where available; unavailable attribution remains direct/other. Arbitrary URL query values, IP addresses, optional city and size are not stored.

## Build and checks

Node tests use SQLite with the exact generated migrations and application SQL. The Worker ESM build emits `dist/server/index.js`, existing assets under `dist/client`, logical hosting metadata and migrations under `dist/.openai`. Dependencies are development-only migration tooling. Preview uses a separate local SQLite database, never production data.

Desktop and 390/320px mobile UI checks cover quiz navigation/completion/close, product search/filters, nine-photo gallery, optional fields, WhatsApp draft context, product contact activation and mobile menu. Production D1 receipt must also be checked after deployment.

## Phase boundary

Stop after Phase 1. Future WhatsApp Business event synchronization, CRM, JEV/IA, advertising, recovery flows and pricing rules require their own scope and real external connections.
