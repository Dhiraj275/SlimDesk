import Decimal from 'decimal.js';
import { TaxMode, TaxDetails } from '../types/invoice.types';

export interface FormInvoiceItemInput {
  description: string;
  quantity: number | string;
  unit?: string;
  unitPrice: number | string;
  discountAmount?: number | string;
  taxRate?: number | string;
  sortOrder?: number;
}

export interface CalculatedInvoiceSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxDetails: TaxDetails | null;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    sortOrder: number;
  }>;
}

export function calculateInvoiceSummary(
  items: FormInvoiceItemInput[],
  taxMode: TaxMode = 'none',
  overallDiscount: number | string = 0,
  freelancerState?: string,
  clientState?: string
): CalculatedInvoiceSummary {
  const isTaxActive = taxMode !== 'none';
  let runningSubtotal = new Decimal(0);
  let runningTax = new Decimal(0);

  const calculatedItems = (items || []).map((item, idx) => {
    const qty = new Decimal(Number(item.quantity) || 1);
    const price = new Decimal(Number(item.unitPrice) || 0);
    const rawSubtotal = qty.mul(price);
    const lineDiscount = new Decimal(Number(item.discountAmount) || 0);
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
      discountAmount: lineDiscount.toNumber(),
      taxRate: rate.toNumber(),
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

  let taxDetails: TaxDetails | null = null;
  if (taxMode === 'gst' && finalTax.gt(0)) {
    const isInterState =
      Boolean(freelancerState) &&
      Boolean(clientState) &&
      freelancerState?.trim().toLowerCase() !== clientState?.trim().toLowerCase();

    if (isInterState) {
      taxDetails = {
        isInterState: true,
        placeOfSupply: clientState || null,
        igstAmount: finalTax.toNumber(),
        cgstAmount: 0,
        sgstAmount: 0,
      };
    } else {
      const halfTax = finalTax.div(2).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      taxDetails = {
        isInterState: false,
        placeOfSupply: clientState || freelancerState || null,
        cgstAmount: halfTax.toNumber(),
        sgstAmount: halfTax.toNumber(),
        igstAmount: 0,
      };
    }
  }

  return {
    subtotal: subtotal.toNumber(),
    discountAmount: disc.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    taxAmount: finalTax.toNumber(),
    totalAmount: grandTotal.toNumber(),
    taxDetails,
    items: calculatedItems,
  };
}

