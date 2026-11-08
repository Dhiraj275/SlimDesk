import numberToWords from 'number-to-words';

const safeToWords = (val: number): string => {
  if (typeof numberToWords?.toWords === 'function') {
    return numberToWords.toWords(val);
  }
  if (typeof (numberToWords as any)?.default?.toWords === 'function') {
    return (numberToWords as any).default.toWords(val);
  }
  return String(val);
};

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
  AED: {
    whole: 'Dirham',
    wholePlural: 'Dirhams',
    fraction: 'Fils',
    fractionPlural: 'Fils',
  },
};

const titleCase = (text: string) =>
  text.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

/**
 * Converts numbers into the Indian numbering system (Crores, Lakhs, Thousands, Hundreds).
 */
function convertNumberToIndianWords(num: number): string {
  if (num === 0) return 'Zero';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertBelowThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore > 0) {
    result += convertBelowThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertBelowThousand(remainder);
  }

  return result.trim();
}

export const formatAmountInWords = (
  amount: number | string,
  currency: string = 'INR'
): string => {
  const numericAmount =
    typeof amount === 'number'
      ? amount
      : parseFloat(String(amount || 0));

  if (!Number.isFinite(numericAmount) || numericAmount === 0) {
    return 'Zero Only';
  }

  const curr = (currency || 'INR').trim().toUpperCase();
  const labels = CURRENCY_LABELS[curr] || {
    whole: curr,
    wholePlural: curr,
    fraction: 'Cent',
    fractionPlural: 'Cents',
  };

  const isNegative = numericAmount < 0;
  const absAmount = Math.abs(numericAmount);

  const integerPart = Math.floor(absAmount);
  const fractionPart = Math.round((absAmount - integerPart) * 100);

  let integerWords = '';
  if (integerPart > 0) {
    try {
      if (curr === 'INR') {
        integerWords = convertNumberToIndianWords(integerPart);
      } else {
        integerWords = titleCase(safeToWords(integerPart).replace(/[-,]/g, ' '));
      }
    } catch {
      integerWords = String(integerPart);
    }
  }

  let fractionWords = '';
  if (fractionPart > 0) {
    try {
      if (curr === 'INR') {
        fractionWords = convertNumberToIndianWords(fractionPart);
      } else {
        fractionWords = titleCase(safeToWords(fractionPart).replace(/[-,]/g, ' '));
      }
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

  return parts.join(' ').replace(/\s+/g, ' ').trim();
};
