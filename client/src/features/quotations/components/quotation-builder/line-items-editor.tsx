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
import { TaxMode } from '../../types/quotation.types';
import { FormItemInput } from '../../utils/quotation-calc';
import { IconPlus, IconTrash, IconLayersLinked } from '@tabler/icons-react';

interface LineItemsEditorProps {
  items: FormItemInput[];
  onChange: (items: FormItemInput[]) => void;
  taxMode: TaxMode;
  currencySymbol?: string;
}

const UNIT_OPTIONS = [
  { value: 'units', label: 'Units' },
  { value: 'hrs', label: 'Hours (hrs)' },
  { value: 'days', label: 'Days' },
  { value: 'project', label: 'Project' },
  { value: 'milestone', label: 'Milestone' },
];

const GST_RATE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18% (Standard)' },
  { value: 28, label: '28%' },
];

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
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
        unitPrice: 0,
        discount: 0,
        taxRate: isTaxActive ? 18 : 0,
        sortOrder: items.length,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof FormItemInput, val: any) => {
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
    <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
      <CardHeader className='pb-3 flex flex-row items-center justify-between'>
        <div className='space-y-1'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
            <IconLayersLinked className='h-4 w-4 text-primary' />
            Scope & Deliverable Line Items
          </CardTitle>
          <p className='text-xs text-muted-foreground'>
            Break down the proposal into clear deliverable milestones, services, or units.
          </p>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={addItem}
          className='h-9 text-xs gap-1.5 shrink-0'
        >
          <IconPlus className='h-4 w-4' />
          <span>Add Item</span>
        </Button>
      </CardHeader>
      <CardContent className='p-0 sm:p-6 sm:pt-0'>
        <div className='overflow-x-auto custom-scrollbar border-t sm:border border-border/50 sm:rounded-xl'>
          <table className='w-full text-left text-xs'>
            <thead>
              <tr className='border-b border-border/50 bg-muted/30 font-semibold uppercase tracking-wider text-muted-foreground text-[11px]'>
                <th className='py-3 pl-4 pr-2 sm:pl-4 min-w-[200px]'>Deliverable Description</th>
                <th className='px-2 py-3 w-20 text-center'>Qty</th>
                <th className='px-2 py-3 w-28'>Unit</th>
                <th className='px-2 py-3 w-32 text-right'>Rate ({currencySymbol})</th>
                {isTaxActive && (
                  <th className='px-2 py-3 w-24 text-center'>Tax Rate</th>
                )}
                <th className='px-2 py-3 w-32 text-right'>Subtotal</th>
                <th className='py-3 pl-1 pr-4 sm:pr-4 w-10 text-right'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/40'>
              {items.map((item, index) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.unitPrice) || 0;
                const disc = Number(item.discount) || 0;
                const lineSubtotal = Math.max(0, qty * price - disc);

                return (
                  <tr key={index} className='hover:bg-muted/20 transition-colors'>
                    {/* Description */}
                    <td className='py-2.5 pl-4 pr-2 sm:pl-4 align-top'>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, 'description', e.target.value)
                        }
                        placeholder='e.g. UX wireframes, landing page UI, React frontend...'
                        className='h-9 text-xs'
                      />
                    </td>

                    {/* Qty */}
                    <td className='px-2 py-2.5 align-top'>
                      <Input
                        type='number'
                        min='1'
                        step='1'
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='h-9 text-xs text-center tabular-nums'
                      />
                    </td>

                    {/* Unit */}
                    <td className='px-2 py-2.5 align-top'>
                      <Select
                        value={item.unit}
                        onValueChange={(val) => updateItem(index, 'unit', val)}
                      >
                        <SelectTrigger className='h-9 text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u.value} value={u.value} className='text-xs'>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Unit Price */}
                    <td className='px-2 py-2.5 align-top'>
                      <Input
                        type='number'
                        min='0'
                        step='100'
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='h-9 text-xs text-right tabular-nums'
                      />
                    </td>

                    {/* Tax Rate (Only when tax mode active) */}
                    {isTaxActive && (
                      <td className='px-2 py-2.5 align-top'>
                        <Select
                          value={String(item.taxRate ?? 0)}
                          onValueChange={(val) =>
                            updateItem(index, 'taxRate', parseFloat(val) || 0)
                          }
                        >
                          <SelectTrigger className='h-9 text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATE_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                                className='text-xs'
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    )}

                    {/* Line Total */}
                    <td className='px-2 py-2.5 text-right font-semibold text-foreground text-xs tabular-nums align-middle'>
                      {currencySymbol}
                      {lineSubtotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Delete Item */}
                    <td className='py-2.5 pl-1 pr-4 sm:pr-4 text-right align-top'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        className='h-9 w-9 text-muted-foreground hover:text-destructive'
                        aria-label='Delete item'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
