/**
 * Fixed rates used only for organization-level analytics.
 * Salary rows stay in the employee's local currency.
 * amount_usd = amount * rate.
 */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
};

export const SUPPORTED_CURRENCIES = Object.keys(USD_RATES);

export function toUsd(amount: number, currency: string) {
  const rate = USD_RATES[currency.toUpperCase()];
  if (rate === undefined) {
    throw new Error(`Unsupported currency ${currency}`);
  }
  return amount * rate;
}

export function usdCaseSql(amountExpr: string, currencyExpr: string) {
  const whens = Object.entries(USD_RATES)
    .map(([code, rate]) => `WHEN '${code}' THEN ${amountExpr} * ${rate}`)
    .join(' ');
  return `CASE ${currencyExpr} ${whens} ELSE NULL END`;
}
