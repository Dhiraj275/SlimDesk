'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TaxMode } from '../../types/invoice.types';
import { FormInvoiceItemInput } from '../../utils/invoice-calc';
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconArrowUp,
  IconArrowDown,
  IconLayersLinked,
} from '@tabler/icons-react';

interface InvoiceLineItemsEditorProps {
  items: FormInvoiceItemInput[];
  onChange: (items: FormInvoiceItemInput[]) => void;
  taxMode: TaxMode;
  currencySymbol?: string;
}

const UNIT_OPTIONS = [
  { value: 'units', label: 'Units' },
  { value: 'hrs', label: 'Hours (hrs)' },
  { value: 'days', label: 'Days' },
  { value: 'project', label: 'Project' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'month', label: 'Month' },
  { value: 'screen', label: 'Screen' },
  { value: 'page', label: 'Page' },
];

const GST_RATE_OPTIONS = [
  { value: 0, label: '0% (Exempt)' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18% (Standard)' },
  { value: 28, label: '28%' },
];

export const InvoiceLineItemsEditor: React.FC<InvoiceLineItemsEditorProps> = ({
  items,
  onChange,
  taxMode,
  currencySymbol = '₹',
}) => {
  const isTaxActive = taxMode !== 'none';

  const addItem = () => {
    onChange([
      ...items,
      {
        description: '',
        quantity: 1,
        unit: 'units',
        unitPrice: '',
        discountAmount: 0,
        taxRate: isTaxActive ? 18 : 0,
        sortOrder: items.length,
      },
    ]);
  };

  const duplicateItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    const cloned: FormInvoiceItemInput = {
      ...source,
      description: source.description ? `${source.description} (Copy)` : '',
      sortOrder: items.length,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, cloned);
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const updateItem = (
    index: number,
    field: keyof FormInvoiceItemInput,
    val: any
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Card className='border-border/60 shadow-2xs'>
      <CardHeader className='pb-3 pt-5 px-5 sm:px-6 flex flex-row items-center justify-between border-b border-border/40'>
        <div>
          <CardTitle className='text-sm sm:text-base font-bold text-foreground'>
            Billed Deliverables & Services
          </CardTitle>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Itemize services, deliverables, hours or units requested for payment.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={addItem}
          className='gap-1.5 h-8 text-xs font-medium shadow-2xs'
        >
          <IconPlus className='h-3.5 w-3.5' />
          <span>Add Line Item</span>
        </Button>
      </CardHeader>

      <CardContent className='p-4 sm:p-6 space-y-3'>
        {items.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/10'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2'>
              <IconLayersLinked className='h-5 w-5' />
            </div>
            <p className='text-xs font-semibold text-foreground'>No items added yet</p>
            <p className='text-[11px] text-muted-foreground mt-0.5'>
              Add deliverables or services to request payment.
            </p>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={addItem}
              className='mt-3 h-8 text-xs gap-1.5 font-medium'
            >
              <IconPlus className='h-3.5 w-3.5' />
              <span>Add First Item</span>
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            {items.map((item, index) => {
              const qty = parseFloat(String(item.quantity || 0)) || 0;
              const price = parseFloat(String(item.unitPrice || 0)) || 0;
              const disc = parseFloat(String(item.discountAmount || 0)) || 0;
              const taxable = Math.max(0, qty * price - disc);
              const rate = isTaxActive ? parseFloat(String(item.taxRate || 0)) || 0 : 0;
              const tax = taxable * (rate / 100);
              const lineTotal = taxable + tax;

              return (
                <div
                  key={index}
                  className='rounded-xl border border-border/60 bg-card p-3 sm:p-4 shadow-2xs space-y-3 hover:border-border transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground'>
                        {index + 1}
                      </span>
                      <span className='text-xs font-semibold text-foreground/80'>
                        Item Details
                      </span>
                    </div>

                    <div className='flex items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={index === 0}
                        onClick={() => moveItem(index, 'up')}
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        title='Move Up'
                      >
                        <IconArrowUp className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(index, 'down')}
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        title='Move Down'
                      >
                        <IconArrowDown className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => duplicateItem(index)}
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        title='Duplicate Item'
                      >
                        <IconCopy className='h-3.5 w-3.5' />
                      </Button>
                      {items.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeItem(index)}
                          className='h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                          title='Delete Item'
                        >
                          <IconTrash className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Input
                      type='text'
                      required
                      placeholder='Description (e.g. UI/UX Design, Frontend Development, API Integration...)'
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      className='h-9 text-xs sm:text-sm font-medium bg-background'
                    />
                  </div>

                  {/* Numerical Inputs Grid */}
                  <div className='grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs'>
                    {/* Unit */}
                    <div className='space-y-1'>
                      <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                        Unit
                      </label>
                      <Select
                        value={item.unit || 'units'}
                        onValueChange={(val) => updateItem(index, 'unit', val)}
                      >
                        <SelectTrigger className='h-8 text-xs bg-background'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Qty */}
                    <div className='space-y-1'>
                      <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                        Qty
                      </label>
                      <Input
                        type='text'
                        inputMode='decimal'
                        value={item.quantity ?? ''}
                        onChange={(e) =>
                          updateItem(index, 'quantity', e.target.value)
                        }
                        className='h-8 text-xs font-mono bg-background'
                        placeholder='1'
                      />
                    </div>

                    {/* Rate */}
                    <div className='space-y-1'>
                      <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                        Rate ({currencySymbol})
                      </label>
                      <Input
                        type='text'
                        inputMode='decimal'
                        value={item.unitPrice ?? ''}
                        onChange={(e) =>
                          updateItem(index, 'unitPrice', e.target.value)
                        }
                        className='h-8 text-xs font-mono bg-background'
                        placeholder='0.00'
                      />
                    </div>

                    {/* Tax Rate (if active) */}
                    {isTaxActive ? (
                      <div className='space-y-1'>
                        <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                          Tax Rate
                        </label>
                        <Select
                          value={String(item.taxRate ?? 18)}
                          onValueChange={(val) =>
                            updateItem(index, 'taxRate', parseFloat(val))
                          }
                        >
                          <SelectTrigger className='h-8 text-xs bg-background font-mono'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className='space-y-1'>
                        <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block'>
                          Discount ({currencySymbol})
                        </label>
                        <Input
                          type='text'
                          inputMode='decimal'
                          value={item.discountAmount ?? 0}
                          onChange={(e) =>
                            updateItem(index, 'discountAmount', e.target.value)
                          }
                          className='h-8 text-xs font-mono bg-background'
                          placeholder='0'
                        />
                      </div>
                    )}

                    {/* Line Total */}
                    <div className='space-y-1 col-span-2 sm:col-span-1 text-right flex flex-col justify-end'>
                      <label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-right'>
                        Line Total
                      </label>
                      <div className='h-8 flex items-center justify-end font-mono font-bold text-xs sm:text-sm text-foreground'>
                        {currencySymbol}
                        {lineTotal.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

