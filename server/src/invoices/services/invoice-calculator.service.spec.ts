import { describe, it, expect } from 'vitest';
import { InvoiceCalculatorService } from './invoice-calculator.service.js';
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { PaymentRecordStatus } from '../enums/payment-record-status.enum.js';
import { InvoicePayment } from '../entities/invoice-payment.entity.js';

describe('InvoiceCalculatorService', () => {
  const calculator = new InvoiceCalculatorService();

  describe('calculate (Totals & Taxes)', () => {
    it('should default to TaxMode.NONE and calculate subtotal equal to total', () => {
      const result = calculator.calculate({
        items: [
          { description: 'UI/UX Design', quantity: 1, unitPrice: 10000 },
          { description: 'Frontend Development', quantity: 1, unitPrice: 20000 },
        ],
      });

      expect(result.taxMode).toBe(TaxMode.NONE);
      expect(result.subtotal).toBe(30000);
      expect(result.taxAmount).toBe(0);
      expect(result.totalAmount).toBe(30000);
      expect(result.taxDetails).toBeNull();
    });

    it('should calculate Intra-State GST with 50/50 split between CGST and SGST', () => {
      const result = calculator.calculate({
        taxMode: TaxMode.GST,
        freelancerState: 'Maharashtra',
        clientState: 'Maharashtra',
        items: [
          {
            description: 'Consulting',
            quantity: 1,
            unitPrice: 45000,
            taxRate: 18,
          },
        ],
      });

      expect(result.subtotal).toBe(45000);
      expect(result.taxAmount).toBe(8100);
      expect(result.totalAmount).toBe(53100);
      expect(result.taxDetails).toEqual({
        isInterState: false,
        placeOfSupply: 'Maharashtra',
        cgstAmount: 4050,
        sgstAmount: 4050,
        igstAmount: 0,
      });
    });

    it('should calculate Inter-State GST with 100% IGST', () => {
      const result = calculator.calculate({
        taxMode: TaxMode.GST,
        freelancerState: 'Maharashtra',
        clientState: 'Karnataka',
        items: [
          {
            description: 'Cloud Architecture',
            quantity: 1,
            unitPrice: 50000,
            taxRate: 18,
          },
        ],
      });

      expect(result.subtotal).toBe(50000);
      expect(result.taxAmount).toBe(9000);
      expect(result.totalAmount).toBe(59000);
      expect(result.taxDetails).toEqual({
        isInterState: true,
        placeOfSupply: 'Karnataka',
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 9000,
      });
    });
  });

  describe('computePaymentState (Payment Status Separation)', () => {
    const makePayment = (
      amount: number,
      status: PaymentRecordStatus = PaymentRecordStatus.COMPLETED,
    ): InvoicePayment =>
      ({
        paymentId: 'p1',
        invoiceId: 'inv1',
        userId: 'u1',
        amount,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: '2026-11-08',
        status,
        createdAt: new Date(),
      }) as InvoicePayment;

    it('should mark draft invoices as UNPAID', () => {
      const state = calculator.computePaymentState(
        50000,
        '2026-11-20',
        InvoiceStatus.DRAFT,
        [],
        '2026-11-08',
      );

      expect(state.paymentStatus).toBe(PaymentStatus.UNPAID);
      expect(state.paidAmount).toBe(0);
      expect(state.outstandingAmount).toBe(50000);
      expect(state.isOverdue).toBe(false);
      expect(state.paymentPercentage).toBe(0);
    });

    it('should derive PARTIALLY_PAID when partial payment received before due date', () => {
      const payments = [makePayment(20000)];
      const state = calculator.computePaymentState(
        50000,
        '2026-11-20',
        InvoiceStatus.ISSUED,
        payments,
        '2026-11-08',
      );

      expect(state.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
      expect(state.paidAmount).toBe(20000);
      expect(state.outstandingAmount).toBe(30000);
      expect(state.isOverdue).toBe(false);
      expect(state.paymentPercentage).toBe(40);
    });

    it('should derive PAID when full amount received', () => {
      const payments = [makePayment(25000), makePayment(25000)];
      const state = calculator.computePaymentState(
        50000,
        '2026-11-20',
        InvoiceStatus.ISSUED,
        payments,
        '2026-11-08',
      );

      expect(state.paymentStatus).toBe(PaymentStatus.PAID);
      expect(state.paidAmount).toBe(50000);
      expect(state.outstandingAmount).toBe(0);
      expect(state.isOverdue).toBe(false);
      expect(state.paymentPercentage).toBe(100);
    });

    it('should derive OVERDUE when current date is past due date and outstanding balance remains', () => {
      const payments = [makePayment(20000)];
      const state = calculator.computePaymentState(
        50000,
        '2026-11-01',
        InvoiceStatus.ISSUED,
        payments,
        '2026-11-08', // past due date 2026-11-01
      );

      expect(state.paymentStatus).toBe(PaymentStatus.OVERDUE);
      expect(state.isOverdue).toBe(true);
      expect(state.outstandingAmount).toBe(30000);
    });

    it('should NOT mark invoice OVERDUE if fully paid even if past due date', () => {
      const payments = [makePayment(50000)];
      const state = calculator.computePaymentState(
        50000,
        '2026-11-01',
        InvoiceStatus.ISSUED,
        payments,
        '2026-11-08',
      );

      expect(state.paymentStatus).toBe(PaymentStatus.PAID);
      expect(state.isOverdue).toBe(false);
      expect(state.outstandingAmount).toBe(0);
    });

    it('should derive REFUNDED if all completed payments were refunded', () => {
      const payments = [makePayment(50000, PaymentRecordStatus.REFUNDED)];
      const state = calculator.computePaymentState(
        50000,
        '2026-11-20',
        InvoiceStatus.ISSUED,
        payments,
        '2026-11-08',
      );

      expect(state.paymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(state.paidAmount).toBe(0);
      expect(state.outstandingAmount).toBe(50000);
      expect(state.refundedAmount).toBe(50000);
    });
  });
});

