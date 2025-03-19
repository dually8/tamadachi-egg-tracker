import { PrismaClient } from '@prisma/client';
import playwright from 'playwright';

const prisma = new PrismaClient();
const sites = {
  traderJoes: 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124',
  // foodCity: 'https://www.foodcity.com/product/703/0003680017019',
  // target: 'https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534#lnk=sametab',
  // aldi: 'https://shop.aldi.us/store/aldi/products/115095-goldhen-grade-a-large-eggs-12-ct',
  // instacart: 'https://www.instacart.com/store',
} as const;

export async function main() {
  await checkTraderJoes();
}

async function checkTraderJoes() {
  const site = sites.traderJoes;
  const browser = await playwright.chromium.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(site);

  const price = await page
    .locator('.aem-GridColumn')
    .getByText(/\$\d+\.\d{2}/)
    .textContent();

  console.log(`Trader Joe's price: ${price}`);

  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');

  console.log(`Trader Joe's parsed price: ${parsedPrice}`);

  await prisma.eggPrice.create({
    data: {
      price: parsedPrice,
      storeLocation: 'Chattanooga, TN',
      storeName: "Trader Joe's",
      date: new Date(),
    },
  });

  await browser.close();
}

main()
  .catch(console.error)
  .finally(() => console.log('Done!'));
