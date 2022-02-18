import { utils } from 'ynab';

export function formatToReadablePrice(price: number) {
  const fmtPrice = utils.convertMilliUnitsToCurrencyAmount(price, 2);
  return fmtPrice;
}

export function formatToYnabPrice(price: string | number) {
  return Number(price) * 1000;
}

export function getCurrentMonth() {
  return new Intl.DateTimeFormat('en-us', { month: 'long' }).format(new Date(utils.getCurrentDateInISOFormat()));
}
