import { utils } from 'ynab';

export function formatToReadablePrice(price: number) {
  return utils.convertMilliUnitsToCurrencyAmount(price, 2);
}

export function formatToYnabPrice(price: string | number) {
  return Number(price) * 1000;
}
