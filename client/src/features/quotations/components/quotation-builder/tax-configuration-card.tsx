'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TaxMode } from '../../types/quotation.types';
import { IconReceipt, IconCheck, IconShieldCheck } from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface TaxConfigurationCardProps {
  taxMode: TaxMode;
  onTaxModeChange: (mode: TaxMode) => void;
  freelancerGstin?: string | null;
  onFreelancerGstinChange: (val: string) => void;
  clientGstin?: string | null;
  onClientGstinChange: (val: string) => void;
  placeOfSupply?: string | null;
  onPlaceOfSupplyChange: (val: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const TaxConfigurationCard: React.FC<TaxConfigurationCardProps> = ({
  taxMode,
  onTaxModeChange,
  freelancerGstin,
  onFreelancerGstinChange,
  clientGstin,
  onClientGstinChange,
  placeOfSupply,
  onPlaceOfSupplyChange,
}) => {
  return (
    <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconReceipt className='h-4 w-4 text-primary' />
              Tax & GST Configuration
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Optional tax calculation. Most freelancers without GST should leave this as "No Tax".
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Tax Mode Selection Tabs / Radio Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          {/* None (Default) */}
          <div
            onClick={() => onTaxModeChange('none')}
            className={cn(
              'p-3.5 rounded-xl border transition-all cursor-pointer space-y-1',
              taxMode === 'none'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border/60 hover:border-border hover:bg-muted/20'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-xs text-foreground'>No Tax (0%)</span>
              {taxMode === 'none' && (
                <IconCheck className='h-3.5 w-3.5 text-primary stroke-[3]' />
              )}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Clean quotation without tax calculation or GST breakdown.
            </p>
          </div>

          {/* Simple Flat Tax */}
          <div
            onClick={() => onTaxModeChange('flat')}
            className={cn(
              'p-3.5 rounded-xl border transition-all cursor-pointer space-y-1',
              taxMode === 'flat'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border/60 hover:border-border hover:bg-muted/20'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-xs text-foreground'>Standard Flat Tax</span>
              {taxMode === 'flat' && (
                <IconCheck className='h-3.5 w-3.5 text-primary stroke-[3]' />
              )}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Applies standard flat tax percentage (e.g. VAT or flat rate).
            </p>
          </div>

          {/* Indian GST */}
          <div
            onClick={() => onTaxModeChange('gst')}
            className={cn(
              'p-3.5 rounded-xl border transition-all cursor-pointer space-y-1',
              taxMode === 'gst'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border/60 hover:border-border hover:bg-muted/20'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-xs text-foreground'>Indian GST (IGST/CGST)</span>
              {taxMode === 'gst' && (
                <IconCheck className='h-3.5 w-3.5 text-primary stroke-[3]' />
              )}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Intra-state (CGST+SGST) or Inter-state (IGST) split.
            </p>
          </div>
        </div>

        {/* GST Specific Fields */}
        {taxMode === 'gst' && (
          <div className='pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Your GSTIN (Optional)</Label>
              <Input
                value={freelancerGstin || ''}
                onChange={(e) => onFreelancerGstinChange(e.target.value.toUpperCase())}
                placeholder='27AAAAA0000A1Z5'
                className='h-10 text-xs font-mono uppercase'
                maxLength={15}
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Client GSTIN (Optional)</Label>
              <Input
                value={clientGstin || ''}
                onChange={(e) => onClientGstinChange(e.target.value.toUpperCase())}
                placeholder='29BBBBB1111B1Z6'
                className='h-10 text-xs font-mono uppercase'
                maxLength={15}
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Place of Supply (State)</Label>
              <Select
                value={placeOfSupply || 'Maharashtra'}
                onValueChange={onPlaceOfSupplyChange}
              >
                <SelectTrigger className='h-10 text-xs'>
                  <SelectValue placeholder='Select state' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state} className='text-xs'>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
