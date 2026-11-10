'use client';

import React, { useState, useEffect } from 'react';
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
import { IconBuilding, IconDeviceFloppy } from '@tabler/icons-react';

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

export const BusinessProfileTab: React.FC = () => {
  const { settings, updateBusinessProfile } = useSettings();
  const [form, setForm] = useState(settings.businessProfile);

  useEffect(() => {
    setForm(settings.businessProfile);
  }, [settings.businessProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(form);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconBuilding className='h-4 w-4 text-primary' />
              Business Identity & Legal Entity
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Your company details will automatically populate as the "From" party on all new quotations and invoices.
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Studio / Brand Name</Label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder='e.g. SlimDesk Studio'
                className='h-10 text-xs'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Legal Entity Name (Optional)</Label>
              <Input
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                placeholder='e.g. SlimDesk Creative Studio LLP'
                className='h-10 text-xs'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Business Email</Label>
              <Input
                type='email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder='hello@slimdesk.studio'
                className='h-10 text-xs'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Phone Number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder='+91 98765 43210'
                className='h-10 text-xs'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>Registered Billing Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder='Suite 402, High Street, Mumbai 400021'
              className='h-10 text-xs'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>GSTIN (Goods and Services Tax ID)</Label>
              <Input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder='27AABCU9603R1ZM'
                className='h-10 text-xs font-mono'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>State of Supply</Label>
              <Select
                value={form.state}
                onValueChange={(val) => setForm({ ...form, state: val })}
              >
                <SelectTrigger className='h-10 text-xs'>
                  <SelectValue placeholder='Select state' />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s} className='text-xs'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='pt-2 flex justify-end'>
            <Button type='submit' size='sm' className='h-9 text-xs gap-1.5 shadow-xs'>
              <IconDeviceFloppy className='h-4 w-4' />
              <span>Save Business Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

