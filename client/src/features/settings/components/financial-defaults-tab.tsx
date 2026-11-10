'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useSettings } from '../context/settings-context';
import { IconCoins, IconNumbers, IconDeviceFloppy } from '@tabler/icons-react';

export const FinancialDefaultsTab: React.FC = () => {
  const { settings, updateFinancialDefaults, updateNumbering } = useSettings();
  const [finForm, setFinForm] = useState(settings.financialDefaults);
  const [numForm, setNumForm] = useState(settings.numbering);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancialDefaults(finForm);
    updateNumbering(numForm);
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Financial Defaults */}
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconCoins className='h-4 w-4 text-primary' />
              Financial & Calculation Defaults
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Pre-configure standard currency, taxation mode, and payment terms for all newly created documents.
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Default Currency</Label>
              <Select
                value={finForm.defaultCurrency}
                onValueChange={(val) => setFinForm({ ...finForm, defaultCurrency: val })}
              >
                <SelectTrigger className='h-10 text-xs font-mono'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='INR' className='text-xs'>INR (₹) - Indian Rupee</SelectItem>
                  <SelectItem value='USD' className='text-xs'>USD ($) - US Dollar</SelectItem>
                  <SelectItem value='EUR' className='text-xs'>EUR (€) - Euro</SelectItem>
                  <SelectItem value='GBP' className='text-xs'>GBP (£) - British Pound</SelectItem>
                  <SelectItem value='AED' className='text-xs'>AED - UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Default Tax Mode</Label>
              <Select
                value={finForm.defaultTaxMode}
                onValueChange={(val: any) => setFinForm({ ...finForm, defaultTaxMode: val })}
              >
                <SelectTrigger className='h-10 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none' className='text-xs'>None (Unregistered Freelancer)</SelectItem>
                  <SelectItem value='gst' className='text-xs'>Indian GST (CGST/SGST/IGST)</SelectItem>
                  <SelectItem value='flat' className='text-xs'>Flat Tax Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Standard Due Date Offset (Days)</Label>
              <Select
                value={String(finForm.defaultDueDateDays)}
                onValueChange={(val) =>
                  setFinForm({ ...finForm, defaultDueDateDays: parseInt(val) || 14 })
                }
              >
                <SelectTrigger className='h-10 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0' className='text-xs'>Due on Receipt (0 days)</SelectItem>
                  <SelectItem value='7' className='text-xs'>Net 7 (7 days)</SelectItem>
                  <SelectItem value='14' className='text-xs'>Net 14 (14 days)</SelectItem>
                  <SelectItem value='30' className='text-xs'>Net 30 (30 days)</SelectItem>
                  <SelectItem value='60' className='text-xs'>Net 60 (60 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Numbering Sequence */}
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconNumbers className='h-4 w-4 text-primary' />
              Document Sequence & Numbering Schemes
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Customize prefix codes and sequential auto-incrementing identifiers for quotations, invoices, and receipts.
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Quotation Prefix</Label>
              <Input
                value={numForm.quotationPrefix}
                onChange={(e) =>
                  setNumForm({ ...numForm, quotationPrefix: e.target.value.toUpperCase() })
                }
                placeholder='QT'
                className='h-10 text-xs font-mono'
              />
              <span className='text-[10px] text-muted-foreground'>
                Example: {numForm.quotationPrefix}-{currentYear}-001
              </span>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Invoice Prefix</Label>
              <Input
                value={numForm.invoicePrefix}
                onChange={(e) =>
                  setNumForm({ ...numForm, invoicePrefix: e.target.value.toUpperCase() })
                }
                placeholder='INV'
                className='h-10 text-xs font-mono'
              />
              <span className='text-[10px] text-muted-foreground'>
                Example: {numForm.invoicePrefix}-{currentYear}-001
              </span>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Receipt Prefix</Label>
              <Input
                value={numForm.receiptPrefix}
                onChange={(e) =>
                  setNumForm({ ...numForm, receiptPrefix: e.target.value.toUpperCase() })
                }
                placeholder='RCT'
                className='h-10 text-xs font-mono'
              />
              <span className='text-[10px] text-muted-foreground'>
                Example: {numForm.receiptPrefix}-{currentYear}-001
              </span>
            </div>
          </div>

          <div className='pt-2 flex justify-end'>
            <Button type='submit' size='sm' className='h-9 text-xs gap-1.5 shadow-xs'>
              <IconDeviceFloppy className='h-4 w-4' />
              <span>Save Financial Preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
