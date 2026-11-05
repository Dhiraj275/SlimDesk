import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { TaxMode } from '../enums/tax-mode.enum.js';

export interface CalculationItemInput {
  description: string;
  quantity: number | string;
  unit?: string;
  unitPrice: number | string;
  discount?: number | string;
  taxRate?: number | string;
  sortOrder?: number;
}

export interface CalculatedItemOutput {
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
}

export interface CalculationInput {
  items: CalculationItemInput[];
  taxMode?: TaxMode;
  discountAmount?: number | string;
  isInterState?: boolean;
  placeOfSupply?: string | null;
  freelancerState?: string | null;
  clientState?: string | null;
}

export interface CalculationResult {
  items: CalculatedItemOutput[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxMode: TaxMode;
  taxDetails: {
    isInterState: boolean;
    placeOfSupply: string | null;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    effectiveTaxRate?: number;
  } | null;
}

@Injectable()
export class QuotationCalculatorService {
  calculate(input: CalculationInput): CalculationResult {
    const taxMode = input.taxMode || TaxMode.NONE;
    const isTaxActive = taxMode !== TaxMode.NONE;

    // Detect inter-state if states provided and not explicitly set
    let isInterState = Boolean(input.isInterState);
    if (
      input.isInterState === undefined &&
      input.freelancerState &&
      input.clientState
    ) {
      isInterState =
        input.freelancerState.trim().toLowerCase() !==
        input.clientState.trim().toLowerCase();
    }

    let runningSubtotal = new Decimal(0);
    let runningTaxAmount = new Decimal(0);

    const calculatedItems: CalculatedItemOutput[] = (input.items || []).map(
      (item, idx) => {
        const qty = new Decimal(item.quantity || 1);
        const price = new Decimal(item.unitPrice || 0);
        const rawLineSubtotal = qty.mul(price);
        const lineDiscount = new Decimal(item.discount || 0);
        const taxableAmount = Decimal.max(0, rawLineSubtotal.sub(lineDiscount));

        let lineTaxRate = new Decimal(0);
        let lineTaxAmount = new Decimal(0);

        if (isTaxActive) {
          lineTaxRate = new Decimal(item.taxRate || 0);
          if (lineTaxRate.gt(0)) {
            lineTaxAmount = taxableAmount
              .mul(lineTaxRate.div(100))
              .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
          }
        }

        const lineTotal = taxableAmount
          .add(lineTaxAmount)
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        runningSubtotal = runningSubtotal.add(taxableAmount);
        runningTaxAmount = runningTaxAmount.add(lineTaxAmount);

        return {
          description: item.description,
          quantity: qty.toNumber(),
          unit: item.unit || 'units',
          unitPrice: price.toNumber(),
          discount: lineDiscount.toNumber(),
          taxRate: lineTaxRate.toNumber(),
          taxableAmount: taxableAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
          taxAmount: lineTaxAmount.toNumber(),
          totalAmount: lineTotal.toNumber(),
          sortOrder: item.sortOrder ?? idx,
        };
      },
    );

    const overallDiscount = new Decimal(input.discountAmount || 0);
    const subtotal = runningSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const netSubtotal = Decimal.max(0, subtotal.sub(overallDiscount));

    let taxAmount = runningTaxAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    if (!isTaxActive) {
      taxAmount = new Decimal(0);
    }

    const totalAmount = netSubtotal
      .add(taxAmount)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    let taxDetails: CalculationResult['taxDetails'] = null;

    if (isTaxActive && taxAmount.gt(0)) {
      if (taxMode === TaxMode.GST) {
        if (isInterState) {
          taxDetails = {
            isInterState: true,
            placeOfSupply: input.placeOfSupply || input.clientState || null,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: taxAmount.toNumber(),
          };
        } else {
          const halfTax = taxAmount.div(2).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
          taxDetails = {
            isInterState: false,
            placeOfSupply: input.placeOfSupply || input.freelancerState || null,
            cgstAmount: halfTax.toNumber(),
            sgstAmount: taxAmount.sub(halfTax).toNumber(), // handles odd penny rounding
            igstAmount: 0,
          };
        }
      } else if (taxMode === TaxMode.FLAT) {
        taxDetails = {
          isInterState: false,
          placeOfSupply: null,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: taxAmount.toNumber(),
        };
      }
    }

    return {
      items: calculatedItems,
      subtotal: subtotal.toNumber(),
      discountAmount: overallDiscount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      taxAmount: taxAmount.toNumber(),
      totalAmount: totalAmount.toNumber(),
      taxMode,
      taxDetails,
    };
  }
}
