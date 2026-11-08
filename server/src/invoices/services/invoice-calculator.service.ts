import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import { PaymentRecordStatus } from '../enums/payment-record-status.enum.js';
import { InvoicePayment } from '../entities/invoice-payment.entity.js';

export interface InvoiceItemCalculationInput {
  description: string;
  quantity: number | string;
  unit?: string;
  unitPrice: number | string;
  discountAmount?: number | string;
  taxRate?: number | string;
  sortOrder?: number;
}

export interface CalculatedInvoiceItemOutput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  sortOrder: number;
}

export interface InvoiceCalculationInput {
  items: InvoiceItemCalculationInput[];
  taxMode?: TaxMode;
  discountAmount?: number | string;
  isInterState?: boolean;
  placeOfSupply?: string | null;
  freelancerState?: string | null;
  clientState?: string | null;
}

export interface InvoiceCalculationResult {
  items: CalculatedInvoiceItemOutput[];
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
  } | null;
}

export interface ComputedPaymentState {
  paidAmount: number;
  outstandingAmount: number;
  refundedAmount: number;
  paymentStatus: PaymentStatus;
  isOverdue: boolean;
  paymentPercentage: number;
}

@Injectable()
export class InvoiceCalculatorService {
  calculate(input: InvoiceCalculationInput): InvoiceCalculationResult {
    const taxMode = input.taxMode || TaxMode.NONE;
    const isTaxActive = taxMode !== TaxMode.NONE;

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

    const calculatedItems: CalculatedInvoiceItemOutput[] = (input.items || []).map(
      (item, idx) => {
        const qty = new Decimal(item.quantity || 1);
        const price = new Decimal(item.unitPrice || 0);
        const rawLineSubtotal = qty.mul(price);
        const lineDiscount = new Decimal(item.discountAmount || 0);
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
          discountAmount: lineDiscount.toNumber(),
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

    let taxDetails: InvoiceCalculationResult['taxDetails'] = null;

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
            sgstAmount: taxAmount.sub(halfTax).toNumber(),
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

  computePaymentState(
    totalAmount: number,
    dueDate: string,
    invoiceStatus: InvoiceStatus,
    payments: InvoicePayment[] = [],
    asOfDate?: string,
  ): ComputedPaymentState {
    const total = new Decimal(totalAmount || 0);
    let completedPaid = new Decimal(0);
    let refundedTotal = new Decimal(0);
    let hasRefundedPayments = false;

    for (const payment of payments) {
      const amt = new Decimal(payment.amount || 0);
      if (payment.status === PaymentRecordStatus.COMPLETED) {
        completedPaid = completedPaid.add(amt);
      } else if (payment.status === PaymentRecordStatus.REFUNDED) {
        refundedTotal = refundedTotal.add(amt);
        hasRefundedPayments = true;
      }
    }

    const outstanding = Decimal.max(0, total.sub(completedPaid)).toDecimalPlaces(
      2,
      Decimal.ROUND_HALF_UP,
    );

    const percentage = total.gt(0)
      ? completedPaid
          .div(total)
          .mul(100)
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
          .toNumber()
      : 0;

    const todayStr = asOfDate || new Date().toISOString().split('T')[0];
    const isPastDue = Boolean(dueDate && todayStr > dueDate);
    const isOverdue = invoiceStatus === InvoiceStatus.ISSUED && outstanding.gt(0) && isPastDue;

    let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;

    if (invoiceStatus === InvoiceStatus.DRAFT) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (completedPaid.gte(total) && total.gt(0)) {
      paymentStatus = PaymentStatus.PAID;
    } else if (isOverdue) {
      paymentStatus = PaymentStatus.OVERDUE;
    } else if (completedPaid.gt(0)) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    } else if (hasRefundedPayments && completedPaid.isZero()) {
      paymentStatus = PaymentStatus.REFUNDED;
    } else {
      paymentStatus = PaymentStatus.UNPAID;
    }

    return {
      paidAmount: completedPaid.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      outstandingAmount: outstanding.toNumber(),
      refundedAmount: refundedTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      paymentStatus,
      isOverdue,
      paymentPercentage: Math.min(100, Math.max(0, percentage)),
    };
  }
}

