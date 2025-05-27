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
  - [ ] Fix theme toggle bug not toggling table and chart theme
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