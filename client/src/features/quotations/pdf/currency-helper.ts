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

export const formatCurrencyText = (currency: string = 'INR', amount: number = 0): string => {
  const curr = (currency || 'INR').toUpperCase();
  const locale = currencyLocaleMap[curr] || 'en-IN';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${curr} ${(amount || 0).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

