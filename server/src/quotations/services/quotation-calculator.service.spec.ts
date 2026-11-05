import { describe, it, expect } from 'vitest';
import { QuotationCalculatorService } from './quotation-calculator.service.js';
import { TaxMode } from '../enums/tax-mode.enum.js';

describe('QuotationCalculatorService', () => {
  const calculator = new QuotationCalculatorService();

  it('should default to TaxMode.NONE and calculate subtotal equal to total when no tax is specified', () => {
    const result = calculator.calculate({
      items: [
        { description: 'Website Redesign', quantity: 1, unitPrice: 25000 },
        { description: 'SEO Optimization', quantity: 2, unitPrice: 5000 },
      ],
    });

    expect(result.taxMode).toBe(TaxMode.NONE);
    expect(result.subtotal).toBe(35000);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(35000);
    expect(result.taxDetails).toBeNull();
    expect(result.items[0].taxRate).toBe(0);
    expect(result.items[0].taxAmount).toBe(0);
    expect(result.items[0].totalAmount).toBe(25000);
  });

  it('should apply line item discounts in TaxMode.NONE', () => {
    const result = calculator.calculate({
      taxMode: TaxMode.NONE,
      items: [
        {
          description: 'Custom Development',
          quantity: 10,
          unitPrice: 1000,
          discount: 500,
        },
      ],
    });

    expect(result.subtotal).toBe(9500);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(9500);
  });

  it('should correctly calculate Intra-State GST (CGST 50% + SGST 50%)', () => {
    const result = calculator.calculate({
      taxMode: TaxMode.GST,
      freelancerState: 'Maharashtra',
      clientState: 'Maharashtra',
      items: [
        {
          description: 'UI/UX Design',
          quantity: 1,
          unitPrice: 10000,
          taxRate: 18,
        },
      ],
    });

    expect(result.subtotal).toBe(10000);
    expect(result.taxAmount).toBe(1800);
    expect(result.totalAmount).toBe(11800);
    expect(result.taxDetails).not.toBeNull();
    expect(result.taxDetails?.isInterState).toBe(false);
    expect(result.taxDetails?.cgstAmount).toBe(900);
    expect(result.taxDetails?.sgstAmount).toBe(900);
    expect(result.taxDetails?.igstAmount).toBe(0);
  });

  it('should correctly calculate Inter-State GST (100% IGST)', () => {
    const result = calculator.calculate({
      taxMode: TaxMode.GST,
      freelancerState: 'Maharashtra',
      clientState: 'Karnataka',
      items: [
        {
          description: 'Backend API Service',
          quantity: 2,
          unitPrice: 15000,
          taxRate: 18,
        },
      ],
    });

    expect(result.subtotal).toBe(30000);
    expect(result.taxAmount).toBe(5400);
    expect(result.totalAmount).toBe(35400);
    expect(result.taxDetails).not.toBeNull();
    expect(result.taxDetails?.isInterState).toBe(true);
    expect(result.taxDetails?.cgstAmount).toBe(0);
    expect(result.taxDetails?.sgstAmount).toBe(0);
    expect(result.taxDetails?.igstAmount).toBe(5400);
  });

  it('should handle odd penny rounding without losing cents in CGST/SGST split', () => {
    const result = calculator.calculate({
      taxMode: TaxMode.GST,
      isInterState: false,
      items: [
        {
          description: 'Consultation',
          quantity: 1,
          unitPrice: 1000.05,
          taxRate: 5,
        },
      ],
    });

    // 1000.05 * 0.05 = 50.0025 -> 50.00
    expect(result.taxAmount).toBe(50.0);
    expect(result.taxDetails?.cgstAmount).toBe(25.0);
    expect(result.taxDetails?.sgstAmount).toBe(25.0);
  });

  it('should support Flat Tax mode', () => {
    const result = calculator.calculate({
      taxMode: TaxMode.FLAT,
      items: [
        {
          description: 'Design Deliverable',
          quantity: 1,
          unitPrice: 2000,
          taxRate: 10,
        },
      ],
    });

    expect(result.taxMode).toBe(TaxMode.FLAT);
    expect(result.subtotal).toBe(2000);
    expect(result.taxAmount).toBe(200);
    expect(result.totalAmount).toBe(2200);
  });
});
