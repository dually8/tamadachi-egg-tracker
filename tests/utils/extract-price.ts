export function extractPrice(price: string): number {
  const priceNumber = parseFloat(price?.trim().replace(/[^0-9.-]+/g, ''));
  return isNaN(priceNumber) ? 0 : priceNumber;
}