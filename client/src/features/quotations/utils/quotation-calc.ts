import Decimal from 'decimal.js';
import { TaxMode } from '../types/quotation.types';

export interface FormItemInput {
  description: string;
  quantity: number | string;
  unit?: string;
  unitPrice: number | string;
  discount?: number | string;
  taxRate?: number | string;
  sortOrder?: number;
}

export interface CalculatedSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    totalAmount: number;
    sortOrder: number;
  }>;
}

export function calculateQuotationSummary(
  items: FormItemInput[],
  taxMode: TaxMode = 'none',
  overallDiscount: number | string = 0
): CalculatedSummary {
  const isTaxActive = taxMode !== 'none';
  let runningSubtotal = new Decimal(0);
  let runningTax = new Decimal(0);

  const calculatedItems = (items || []).map((item, idx) => {
    const qty = new Decimal(Number(item.quantity) || 1);
    const price = new Decimal(Number(item.unitPrice) || 0);
    const rawSubtotal = qty.mul(price);
    const lineDiscount = new Decimal(Number(item.discount) || 0);
    const taxable = Decimal.max(0, rawSubtotal.sub(lineDiscount));

    let rate = new Decimal(0);
    let taxAmt = new Decimal(0);

    if (isTaxActive) {
      rate = new Decimal(Number(item.taxRate) || 0);
      if (rate.gt(0)) {
        taxAmt = taxable.mul(rate.div(100)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      }
    }

    const itemTotal = taxable.add(taxAmt).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    runningSubtotal = runningSubtotal.add(taxable);
    runningTax = runningTax.add(taxAmt);

    return {
      description: item.description || '',
      quantity: qty.toNumber(),
      unit: item.unit || 'units',
      unitPrice: price.toNumber(),
      discount: lineDiscount.toNumber(),
      taxRate: rate.toNumber(),
      taxableAmount: taxable.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      taxAmount: taxAmt.toNumber(),
      totalAmount: itemTotal.toNumber(),
      sortOrder: item.sortOrder ?? idx,
    };
  });

  const disc = new Decimal(Number(overallDiscount) || 0);
  const subtotal = runningSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const netSubtotal = Decimal.max(0, subtotal.sub(disc));
  const finalTax = isTaxActive
    ? runningTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : new Decimal(0);
  const grandTotal = netSubtotal.add(finalTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    subtotal: subtotal.toNumber(),
    discountAmount: disc.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    taxAmount: finalTax.toNumber(),
    totalAmount: grandTotal.toNumber(),
    items: calculatedItems,
  };
}
