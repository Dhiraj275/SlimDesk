'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useSettings } from '../context/settings-context';
import { ServiceItem } from '../types/settings.types';
import {
  IconBriefcase,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

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

export const ServicesCatalogTab: React.FC = () => {
  const { settings, addServiceItem, updateServiceItem, deleteServiceItem } =
    useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    description: '',
    defaultUnit: 'milestone',
    defaultUnitPrice: 10000,
    currency: 'INR',
    taxRate: 18,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      defaultUnit: 'milestone',
      defaultUnitPrice: 10000,
      currency: settings.financialDefaults.defaultCurrency || 'INR',
      taxRate: 18,
      isActive: true,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: ServiceItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      defaultUnit: item.defaultUnit,
      defaultUnitPrice: item.defaultUnitPrice,
      currency: item.currency,
      taxRate: item.taxRate,
      isActive: item.isActive,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateServiceItem(editingId, form);
    } else {
      addServiceItem(form);
    }
    setIsOpen(false);
  };

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cur || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconBriefcase className='h-4 w-4 text-primary' />
              Services Catalog & Line Item Templates
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Define common services, default pricing, and units. You can insert these directly with 1-click while building proposals or invoices.
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={handleOpenAdd}
            className='h-8 text-xs gap-1.5 shadow-xs'
          >
            <IconPlus className='h-3.5 w-3.5' />
            <span>Add Service</span>
          </Button>
        </CardHeader>
        <CardContent className='p-0 sm:p-6 sm:pt-0'>
          {settings.servicesCatalog.length === 0 ? (
            <div className='p-8 text-center border-t sm:border border-border/50 sm:rounded-xl bg-muted/10 m-4 sm:m-0'>
              <p className='text-xs font-semibold text-foreground'>No services in catalog</p>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Save your standard offerings to eliminate repetitive typing in quotes and invoices.
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleOpenAdd}
                className='mt-3 h-8 text-xs gap-1.5'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Add First Service</span>
              </Button>
            </div>
          ) : (
            <div className='border-t sm:border border-border/50 sm:rounded-xl overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-xs'>
                  <thead>
                    <tr className='border-b border-border/50 bg-muted/30 font-semibold uppercase tracking-wider text-muted-foreground text-[11px]'>
                      <th className='py-3 pl-4 pr-3'>Service Name & Scope</th>
                      <th className='px-3 py-3 w-28'>Unit</th>
                      <th className='px-3 py-3 w-32 text-right'>Default Rate</th>
                      <th className='px-3 py-3 w-24 text-center'>Tax Rate</th>
                      <th className='px-3 py-3 w-24 text-center'>Status</th>
                      <th className='py-3 pl-1 pr-4 w-24 text-right'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/40'>
                    {settings.servicesCatalog.map((item) => (
                      <tr key={item.id} className='hover:bg-muted/20 transition-colors'>
                        <td className='py-3 pl-4 pr-3'>
                          <div className='font-semibold text-foreground text-xs'>
                            {item.name}
                          </div>
                          {item.description && (
                            <div className='text-[11px] text-muted-foreground line-clamp-1 mt-0.5'>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className='px-3 py-3 text-muted-foreground capitalize'>
                          {item.defaultUnit}
                        </td>
                        <td className='px-3 py-3 text-right font-mono font-medium text-foreground'>
                          {formatCurrency(item.defaultUnitPrice, item.currency)}
                        </td>
                        <td className='px-3 py-3 text-center font-mono text-muted-foreground'>
                          {item.taxRate}%
                        </td>
                        <td className='px-3 py-3 text-center'>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className='py-3 pl-1 pr-4 text-right whitespace-nowrap'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => handleOpenEdit(item)}
                              className='h-7 w-7 text-muted-foreground hover:text-foreground'
                            >
                              <IconEdit className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => deleteServiceItem(item.id)}
                              className='h-7 w-7 text-rose-500 hover:text-rose-600'
                            >
                              <IconTrash className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md p-6'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='text-base font-bold'>
              {editingId ? 'Edit Service' : 'Add Service to Catalog'}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Provide deliverable details, standard rate, and billing unit.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-1 text-xs'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Service / Deliverable Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. Frontend Development'
                className='h-9 text-xs'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Deliverable Scope / Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder='Provide details on what this service includes...'
                className='text-xs resize-none'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Default Unit</Label>
                <Select
                  value={form.defaultUnit}
                  onValueChange={(val) => setForm({ ...form, defaultUnit: val })}
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
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Default Rate ({form.currency})</Label>
                <Input
                  type='number'
                  min='0'
                  value={form.defaultUnitPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultUnitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className='h-9 text-xs font-mono'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(val) => setForm({ ...form, currency: val })}
                >
                  <SelectTrigger className='h-9 text-xs font-mono'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='INR' className='text-xs'>INR (₹)</SelectItem>
                    <SelectItem value='USD' className='text-xs'>USD ($)</SelectItem>
                    <SelectItem value='EUR' className='text-xs'>EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Standard Tax Rate (%)</Label>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  value={form.taxRate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className='h-9 text-xs font-mono'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsOpen(false)}
              className='h-8 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSave}
              className='h-8 text-xs'
            >
              Save Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

