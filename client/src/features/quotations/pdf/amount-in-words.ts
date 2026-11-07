import { toWords } from 'number-to-words';

const CURRENCY_LABELS: Record<
  string,
  { whole: string; wholePlural: string; fraction: string; fractionPlural: string }
> = {
  INR: {
    whole: 'Rupee',
    wholePlural: 'Rupees',
    fraction: 'Paise',
    fractionPlural: 'Paise',
  },
  USD: {
    whole: 'Dollar',
    wholePlural: 'Dollars',
    fraction: 'Cent',
    fractionPlural: 'Cents',
  },
  EUR: {
    whole: 'Euro',
    wholePlural: 'Euros',
    fraction: 'Cent',
    fractionPlural: 'Cents',
  },
  GBP: {
    whole: 'Pound',
    wholePlural: 'Pounds',
    fraction: 'Penny',
    fractionPlural: 'Pence',
  },
  CAD: {
    whole: 'Canadian Dollar',
    wholePlural: 'Canadian Dollars',
    fraction: 'Cent',
    fractionPlural: 'Cents',
  },
  AUD: {
    whole: 'Australian Dollar',
    wholePlural: 'Australian Dollars',
    fraction: 'Cent',
    fractionPlural: 'Cents',
  },
};

const titleCase = (text: string) =>
  text.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

export const formatAmountInWords = (amount: number, currency: string = 'INR'): string => {
  if (!Number.isFinite(amount) || amount === 0) {
    return 'Zero Only';
  }

  const curr = currency.trim().toUpperCase();
  const labels = CURRENCY_LABELS[curr] || {
    whole: curr,
    wholePlural: curr,
    fraction: 'Cent',
    fractionPlural: 'Cents',
  };

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const integerPart = Math.floor(absAmount);
  const fractionPart = Math.round((absAmount - integerPart) * 100);

  let integerWords = '';
  if (integerPart > 0) {
    try {
      integerWords = toWords(integerPart).replace(/[-,]/g, ' ');
    } catch {
      integerWords = String(integerPart);
    }
  }

  let fractionWords = '';
  if (fractionPart > 0) {
    try {
      fractionWords = toWords(fractionPart).replace(/[-,]/g, ' ');
    } catch {
      fractionWords = String(fractionPart);
    }
  }

  const parts: string[] = [];
  if (isNegative) {
    parts.push('Minus');
  }

  if (integerPart > 0) {
    parts.push(
      `${integerWords} ${integerPart === 1 ? labels.whole : labels.wholePlural}`
    );
  }

  if (fractionPart > 0) {
    if (integerPart > 0) {
      parts.push('and');
    }
    parts.push(
      `${fractionWords} ${fractionPart === 1 ? labels.fraction : labels.fractionPlural}`
    );
  }

  parts.push('Only');

  return titleCase(parts.join(' ').replace(/\s+/g, ' ').trim());
};

