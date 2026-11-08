const currencyLocaleMap: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  AED: 'en-AE',
};

export const formatCurrencyText = (
  currency: string = 'INR',
  amount: number | string = 0
): string => {
  const curr = (currency || 'INR').toUpperCase();
  const locale = currencyLocaleMap[curr] || 'en-IN';
  const val =
    typeof amount === 'number'
      ? amount
      : parseFloat(String(amount || 0)) || 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `${curr} ${val.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};
