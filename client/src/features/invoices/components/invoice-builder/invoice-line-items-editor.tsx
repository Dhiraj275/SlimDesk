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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { TaxMode } from '../../types/invoice.types';
import { FormInvoiceItemInput } from '../../utils/invoice-calc';
import { useSettings } from '@/features/settings/context/settings-context';
import { ServiceItem } from '@/features/settings/types/settings.types';
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconArrowUp,
  IconArrowDown,
  IconLayersLinked,
  IconBriefcase,
  IconChevronDown,
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
  const { settings } = useSettings();
  const catalog = settings.servicesCatalog.filter((s) => s.isActive);

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

  const addFromCatalog = (service: ServiceItem) => {
    onChange([
      ...items,
      {
        description: service.name + (service.description ? ` · ${service.description}` : ''),
        quantity: 1,
        unit: service.defaultUnit || 'units',
        unitPrice: service.defaultUnitPrice,
        discountAmount: 0,
        taxRate: isTaxActive ? service.taxRate : 0,
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
    <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
      <CardHeader className='pb-3 flex flex-row items-center justify-between flex-wrap gap-2'>
        <div className='space-y-1'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
            <IconLayersLinked className='h-4 w-4 text-primary' />
            Billed Deliverables & Services
          </CardTitle>
          <p className='text-xs text-muted-foreground'>
            Itemize services, deliverables, hours or units requested for payment.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {catalog.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-9 text-xs gap-1.5 shrink-0'
                >
                  <IconBriefcase className='h-3.5 w-3.5 text-primary' />
                  <span>Insert from Catalog</span>
                  <IconChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64 max-h-72 overflow-y-auto'>
                <DropdownMenuLabel className='text-[11px] uppercase font-bold text-muted-foreground'>
                  Services Catalog
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {catalog.map((service) => (
                  <DropdownMenuItem
                    key={service.id}
                    onClick={() => addFromCatalog(service)}
                    className='flex flex-col items-start gap-0.5 cursor-pointer py-2'
                  >
                    <span className='font-semibold text-xs text-foreground'>
                      {service.name}
                    </span>
                    <span className='text-[10px] text-muted-foreground font-mono'>
                      {currencySymbol}
                      {service.defaultUnitPrice.toLocaleString('en-IN')} / {service.defaultUnit}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
        </div>
      </CardHeader>

      <CardContent className='p-0 sm:p-6 sm:pt-0'>
        {items.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8 sm:p-12 text-center border-t sm:border border-border/50 sm:rounded-xl bg-muted/10'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3'>
              <IconLayersLinked className='h-6 w-6' />
            </div>
            <h3 className='text-sm font-semibold text-foreground mb-1'>
              No Deliverables Added Yet
            </h3>
            <p className='text-xs text-muted-foreground max-w-sm mb-4'>
              Add deliverable milestones, services, or units to build your invoice.
            </p>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                onClick={addItem}
                className='h-9 text-xs gap-1.5 font-semibold'
              >
                <IconPlus className='h-4 w-4' />
                <span>Add First Line Item</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className='border-t sm:border border-border/50 sm:rounded-xl overflow-hidden'>
            <div className='overflow-x-auto custom-scrollbar'>
              <table className='w-full text-left text-xs'>
                <thead>
                  <tr className='border-b border-border/50 bg-muted/30 font-semibold uppercase tracking-wider text-muted-foreground text-[11px]'>
                    <th className='py-3 pl-4 pr-2 w-12 text-center'>#</th>
                    <th className='py-3 px-2 min-w-[200px]'>Deliverable Description</th>
                    <th className='px-2 py-3 w-20 text-center'>Qty</th>
                    <th className='px-2 py-3 w-28'>Unit</th>
                    <th className='px-2 py-3 w-32 text-right'>Rate ({currencySymbol})</th>
                    {isTaxActive && (
                      <th className='px-2 py-3 w-24 text-center'>Tax Rate</th>
                    )}
                    <th className='px-2 py-3 w-32 text-right'>Subtotal</th>
                    <th className='py-3 pl-1 pr-4 sm:pr-4 w-28 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/40'>
                  {items.map((item, index) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.unitPrice) || 0;
                    const disc = Number(item.discountAmount) || 0;
                    const lineSubtotal = Math.max(0, qty * price - disc);

                    return (
                      <tr key={index} className='hover:bg-muted/20 transition-colors group'>
                        {/* Index */}
                        <td className='py-2.5 pl-4 pr-2 text-center text-muted-foreground font-mono text-[11px] align-middle'>
                          {index + 1}
                        </td>

                        {/* Description */}
                        <td className='py-2.5 px-2 align-top'>
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
                            type='text'
                            inputMode='decimal'
                            value={item.quantity ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                updateItem(index, 'quantity', val);
                              }
                            }}
                            placeholder='1'
                            className='h-9 text-xs text-center tabular-nums font-mono'
                          />
                        </td>

                        {/* Unit */}
                        <td className='px-2 py-2.5 align-top'>
                          <Select
                            value={item.unit || 'units'}
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
                            type='text'
                            inputMode='decimal'
                            value={item.unitPrice ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                updateItem(index, 'unitPrice', val);
                              }
                            }}
                            placeholder='0'
                            className='h-9 text-xs text-right tabular-nums font-mono'
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
                        <td className='px-2 py-2.5 text-right font-semibold font-mono text-foreground text-xs tabular-nums align-middle'>
                          {currencySymbol}
                          {lineSubtotal.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Row Actions: Reorder, Duplicate, Delete */}
                        <td className='py-2.5 pl-1 pr-4 sm:pr-4 text-right align-middle whitespace-nowrap'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => moveItem(index, 'up')}
                              disabled={index === 0}
                              className='h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30'
                              title='Move up'
                            >
                              <IconArrowUp className='h-3.5 w-3.5' />
                            </Button>

                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => moveItem(index, 'down')}
                              disabled={index === items.length - 1}
                              className='h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30'
                              title='Move down'
                            >
                              <IconArrowDown className='h-3.5 w-3.5' />
                            </Button>

                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => duplicateItem(index)}
                              className='h-8 w-8 text-muted-foreground hover:text-foreground'
                              title='Duplicate item'
                            >
                              <IconCopy className='h-3.5 w-3.5' />
                            </Button>

                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => removeItem(index)}
                              disabled={items.length <= 1}
                              className='h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-30'
                              title='Delete item'
                            >
                              <IconTrash className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom table bar */}
            <div className='p-3 border-t border-border/40 bg-muted/20 flex items-center justify-between'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addItem}
                className='h-8 text-xs gap-1.5'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Add Another Deliverable</span>
              </Button>

              <span className='text-xs text-muted-foreground font-medium'>
                {items.length} {items.length === 1 ? 'line item' : 'line items'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
