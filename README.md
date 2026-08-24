# White Whale — Procurement System

A single self-contained HTML file — no backend, no build step, no database.
All CSS and JavaScript live inside `index.html` (including the logo, which
is embedded as base64). Data is entered manually through the UI and stored
in the browser's `localStorage`.

## Running it

Just open `index.html` in a browser, or serve the folder with any static
file server:

```
npx serve .
```

## Deploying (Vercel)

This repo deploys as a static site with zero configuration — Vercel
detects `index.html` at the root automatically. No build command, no
output directory, no environment variables needed.

## Data storage — read this

All data (suppliers, orders, RFQs, payments, etc.) is stored in the
browser's `localStorage`, under a single key. That means:

- Data lives **per browser, per device** — it does not sync between your
  laptop and phone, and does not sync between different people using the
  site.
- Clearing site data / browser storage, or using a different browser or
  incognito window, means starting from an empty database.
- There is no login/auth check that actually protects anything — the
  login screen is a client-side gate only, not real access control.

If multiple people need to share the same data, or you want it to persist
reliably, this file will eventually need a real backend — but that's
explicitly out of scope for this version.

## What's inside `index.html`

- Login screen (client-side only, not real auth)
- Sidebar navigation
- Dashboard
- Suppliers, Components/Inventory, Orders, Purchase Orders, Shipments,
  RFQs (with supplier quotes), Payments, Samples/QC, Users
- Excel export (via the `xlsx` library loaded from a CDN)

External dependencies (loaded from CDN, both required for the app to
render/function correctly):
- Google Fonts (Barlow, Barlow Condensed, Playfair Display, Montserrat)
- `xlsx` (SheetJS) for the Excel export feature
