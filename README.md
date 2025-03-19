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

- [ ] Table stuff
  - [ ] Add filtering
  - [ ] Add sorting
  - [ ] Add pagination
  - [ ] Maybe use ag-grid instead???
- [ ] Build out charts for tracking prices over time

## Resources

- [NextJs](https://nextjs.org/docs/app/getting-started/installation)
- [Drizzle](https://orm.drizzle.team/docs/get-started/sqlite-new)
- [shadcn](https://ui.shadcn.com/docs/installation)
- [playwright](https://playwright.dev/)