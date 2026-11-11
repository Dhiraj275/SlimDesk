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
import { PaymentProfile } from '../types/settings.types';
import {
  IconCreditCard,
  IconPlus,
  IconTrash,
  IconEdit,
  IconStar,
  IconBuildingBank,
  IconDeviceMobile,
  IconWorld,
  IconCash,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

export const PaymentProfilesTab: React.FC = () => {
  const {
    settings,
    addPaymentProfile,
    updatePaymentProfile,
    deletePaymentProfile,
    setDefaultPaymentProfile,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PaymentProfile, 'id'>>({
    name: '',
    type: 'bank_transfer',
    currency: 'INR',
    isDefault: false,
    details: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      type: 'bank_transfer',
      currency: 'INR',
      isDefault: settings.paymentProfiles.length === 0,
      details: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (p: PaymentProfile) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      type: p.type,
      currency: p.currency,
      isDefault: p.isDefault,
      details: p.details,
      bankName: p.bankName || '',
      accountNumber: p.accountNumber || '',
      ifscCode: p.ifscCode || '',
      upiId: p.upiId || '',
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    // Auto-generate details text if left empty
    let detailsText = form.details.trim();
    if (!detailsText) {
      if (form.type === 'upi' && form.upiId) {
        detailsText = `UPI ID: ${form.upiId}\nPayable via GPay, PhonePe, Paytm, or BHIM UPI`;
      } else if (form.bankName || form.accountNumber) {
        detailsText = `Bank: ${form.bankName || 'Bank'}\nA/C No: ${form.accountNumber}\nIFSC: ${form.ifscCode}`;
      }
    }

    if (editingId) {
      updatePaymentProfile(editingId, { ...form, details: detailsText });
    } else {
      addPaymentProfile({ ...form, details: detailsText });
    }
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'upi':
        return <IconDeviceMobile className='h-4 w-4 text-purple-600' />;
      case 'international':
        return <IconWorld className='h-4 w-4 text-sky-600' />;
      case 'cash':
        return <IconCash className='h-4 w-4 text-emerald-600' />;
      default:
        return <IconBuildingBank className='h-4 w-4 text-blue-600' />;
    }
  };

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconCreditCard className='h-4 w-4 text-primary' />
              Payment & Remittance Profiles
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Manage bank accounts, UPI identifiers, and payout instructions to seamlessly inject into invoices.
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={handleOpenAdd}
            className='h-8 text-xs gap-1.5 shadow-xs'
          >
            <IconPlus className='h-3.5 w-3.5' />
            <span>Add Payment Profile</span>
          </Button>
        </CardHeader>
        <CardContent className='space-y-3 pt-1'>
          {settings.paymentProfiles.length === 0 ? (
            <div className='p-8 text-center border border-dashed border-border/80 rounded-xl bg-muted/10'>
              <p className='text-xs font-semibold text-foreground'>No payment profiles added</p>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Add your bank account or UPI ID to make billing clients fast and effortless.
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleOpenAdd}
                className='mt-3 h-8 text-xs gap-1.5'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Add First Profile</span>
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3.5'>
              {settings.paymentProfiles.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    'rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between space-y-3 bg-card',
                    p.isDefault
                      ? 'border-primary/50 bg-primary/[0.02] shadow-xs'
                      : 'border-border/60 hover:border-border'
                  )}
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <div className='h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                          {getTypeIcon(p.type)}
                        </div>
                        <div>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='font-semibold text-xs text-foreground'>
                              {p.name}
                            </span>
                            {p.isDefault && (
                              <span className='px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider'>
                                Default
                              </span>
                            )}
                          </div>
                          <span className='text-[11px] text-muted-foreground capitalize'>
                            {p.type.replace('_', ' ')} · {p.currency}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(p)}
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        >
                          <IconEdit className='h-3.5 w-3.5' />
                        </Button>
                        {settings.paymentProfiles.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => deletePaymentProfile(p.id)}
                            className='h-7 w-7 text-rose-500 hover:text-rose-600'
                          >
                            <IconTrash className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className='font-mono text-[11px] text-muted-foreground/90 whitespace-pre-line leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40'>
                      {p.details}
                    </p>
                  </div>

                  {!p.isDefault && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setDefaultPaymentProfile(p.id)}
                      className='h-7 text-[11px] gap-1 self-start text-muted-foreground hover:text-foreground'
                    >
                      <IconStar className='h-3 w-3' />
                      <span>Set as Default</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Profile Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md p-6'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='text-base font-bold'>
              {editingId ? 'Edit Payment Profile' : 'New Payment Profile'}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Configure bank details, UPI address, or payout guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-1 text-xs'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Profile Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. HDFC Current Account / Personal UPI'
                className='h-9 text-xs'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Payment Method</Label>
                <Select
                  value={form.type}
                  onValueChange={(val: any) => setForm({ ...form, type: val })}
                >
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bank_transfer' className='text-xs'>Bank Transfer (NEFT/RTGS)</SelectItem>
                    <SelectItem value='upi' className='text-xs'>UPI / QR</SelectItem>
                    <SelectItem value='international' className='text-xs'>International Wire / Wise</SelectItem>
                    <SelectItem value='cash' className='text-xs'>Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value='GBP' className='text-xs'>GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === 'upi' ? (
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>UPI ID (VPA)</Label>
                <Input
                  value={form.upiId || ''}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder='freelancer@upi'
                  className='h-9 text-xs font-mono'
                />
              </div>
            ) : form.type === 'bank_transfer' ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <Label className='text-[11px] font-medium'>Bank Name</Label>
                    <Input
                      value={form.bankName || ''}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      placeholder='HDFC Bank'
                      className='h-8 text-xs'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-[11px] font-medium'>IFSC Code</Label>
                    <Input
                      value={form.ifscCode || ''}
                      onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      placeholder='HDFC0000123'
                      className='h-8 text-xs font-mono'
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-medium'>Account Number</Label>
                  <Input
                    value={form.accountNumber || ''}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder='50200087654321'
                    className='h-8 text-xs font-mono'
                  />
                </div>
              </div>
            ) : null}

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Detailed Remittance Text (as shown on Invoice)</Label>
              <Textarea
                rows={3}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder='Leave empty to auto-format from fields above...'
                className='font-mono text-xs resize-none'
              />
            </div>

            <div className='flex items-center gap-2 pt-1'>
              <input
                type='checkbox'
                id='isDefault'
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className='h-4 w-4 rounded border-border/60 text-primary'
              />
              <label htmlFor='isDefault' className='text-xs text-foreground cursor-pointer font-medium'>
                Set as default payment method for new invoices
              </label>
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
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

