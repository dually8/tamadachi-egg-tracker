import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Try hitting /egg-prices instead!' });
});

app.get('/egg-prices', async (c) => {
  const prices = await getEggPrices();
  return c.json(prices);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

async function getEggPrices() {
  const prices = await prisma.eggPrice.findMany();
  return prices;
}
