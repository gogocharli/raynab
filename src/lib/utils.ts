export function formatPrice(price: number) {
  return `${Number(price / 1000).toFixed(2)}`;
}
