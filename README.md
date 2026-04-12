# Tamadachi Egg Price Tracker

> For tracking egg prices over time

Name is a portmanteau of [tamago 卵](https://jpdb.io/vocabulary/1549140/%E5%8D%B5/%E3%81%9F%E3%81%BE%E3%81%94?lang=english#a) and [tomodachi 友達](https://jpdb.io/vocabulary/1540170/%E5%8F%8B%E9%81%94/%E3%81%A8%E3%82%82%E3%81%A0%E3%81%A1?lang=english#a)

## Getting Started

0. Install [NodeJS](https://nodejs.org/en) + [pnpm](https://pnpm.io/)
1. Clone the repo
2. Run `pnpm install` to install the dependencies
3. Create a `.env` file with the following contents: `DB_FILE_NAME=file:local.db`
4. Run the db scripts
   1. `pnpm run db:generate`
   2. `pnpm run db:migrate`
5. Run the playwright scripts to generate data
   1. `pnpm run test`
6. Run the dev server
   1. `pnpm run dev`

## Raspberry Pi Playwright

The default Playwright flow is now tuned for Raspberry Pi and other Linux ARM64 machines:

1. Install dependencies with `pnpm install`
2. Install the Pi browser/runtime dependencies once with `pnpm run test:install:pi`
3. Run the scraper suite with `pnpm test`

`pnpm test` uses Playwright's bundled Chromium in headless mode, which is more reliable on Raspberry Pi than trying to launch Microsoft Edge in a headed session.

### Optional Pi Commands

- `pnpm run test:headed`
- `pnpm run test:debug`
- `pnpm run test:report`

Use `pnpm run test:headed` only when `xvfb-run` is available on the Pi. Headed Playwright on Linux needs Xvfb or a real display server.

### Windows Browser Parity

If you still want to compare behavior against Microsoft Edge on Windows, use `pnpm run test:edge`. That project is only exposed on Windows so the default Linux/Pi path stays on bundled Chromium.

### Troubleshooting

- If the browser fails before any selectors run, retry with `DEBUG=pw:browser pnpm test` to capture launch diagnostics.
- If the suite still passes on Windows but fails on the Pi after launch succeeds, inspect the HTML report, traces, and screenshots before changing selectors.
- The production `Dockerfile` is for the Next.js app only. If you want containerized Playwright later, add a separate Playwright runner image instead of extending the production image.

## Daily Deduplication

The homepage now includes a `Remove duplicate days` maintenance action. It deletes older duplicate rows and keeps only the latest record for each `storeName + storeLocation + local calendar day` group.

Use `pnpm run test:db` to run the Vitest database tests for the dedupe logic. Those tests use an isolated in-memory SQLite database and verify that the latest same-day row is preserved.

## TODO

- [x] Table stuff
  - [x] Add filtering
  - [x] Add sorting
  - [x] Add pagination
  - [x] Maybe use ag-grid instead???
- [x] Build out charts for tracking prices over time
- [ ] Make site cuter with some kawaii eggs and such
- [ ] Bugs
  - [ ] Fix styling issue on mobile (table formatting issue and charts are too squeezed)
  - [x] Fix theme toggle bug not toggling table and chart theme
- [ ] Only pull in latest price check for a given day and only pull in last 2 weeks of data

## Demo

> [!NOTE]
> This site is currently not hosted anywhere because I don't want to host it anywhere for the time being. The image below may or may not reflect the application in its current state.

![Image of application showing egg prices and charts](/docs/img/egg-price-tracker.png)

## Resources

- [NextJs](https://nextjs.org/docs/app/getting-started/installation)
- [Drizzle](https://orm.drizzle.team/docs/get-started/sqlite-new)
- [shadcn](https://ui.shadcn.com/docs/installation)
- [playwright](https://playwright.dev/)
