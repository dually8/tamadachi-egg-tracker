import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const priceTable = sqliteTable('EggPrice', {
  id: int('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().$defaultFn(() => new Date().toISOString()),
  price: real('price').notNull(),
  storeLocation: text('storeLocation').notNull(),
  storeName: text('storeName').notNull(),
});

export type Price = typeof priceTable.$inferSelect;