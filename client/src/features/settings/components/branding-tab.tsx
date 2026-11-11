'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { useSettings } from '../context/settings-context';
import {
  IconPalette,
  IconPhoto,
  IconWriting,
  IconDeviceFloppy,
  IconTrash,
} from '@tabler/icons-react';

export const BrandingTab: React.FC = () => {
  const { settings, updateBranding } = useSettings();
  const [form, setForm] = useState(settings.branding);

  useEffect(() => {
    setForm(settings.branding);
  }, [settings.branding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(form);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, signatureUrl: reader.result as string, signatureType: 'upload' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconPalette className='h-4 w-4 text-primary' />
              Branding & Document Appearance
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Configure your visual logo and digital sign-off to appear on PDFs, public web links, and client receipts.
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Logo Section */}
          <div className='space-y-3 pb-4 border-b border-border/40'>
            <Label className='text-xs font-semibold'>Studio Logo</Label>
            <div className='flex items-center gap-5 flex-wrap'>
              <div className='flex h-20 w-36 items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 overflow-hidden relative'>
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt='Logo Preview'
                    className='max-h-full max-w-full object-contain p-2'
                  />
                ) : (
                  <div className='flex flex-col items-center text-muted-foreground text-[11px]'>
                    <IconPhoto className='h-6 w-6 mb-1 text-muted-foreground/60' />
                    <span>No logo</span>
                  </div>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 text-xs relative cursor-pointer'
                  >
                    <span>Upload Logo</span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleLogoUpload}
                      className='absolute inset-0 opacity-0 cursor-pointer'
                    />
                  </Button>
                  {form.logoUrl && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm({ ...form, logoUrl: '' })}
                      className='h-8 text-xs text-rose-500 hover:text-rose-600'
                    >
                      <IconTrash className='h-3.5 w-3.5 mr-1' />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>
                <p className='text-[11px] text-muted-foreground'>
                  PNG or SVG recommended. Transparent background looks best on document headers.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Signature */}
          <div className='space-y-3 pb-4 border-b border-border/40'>
            <div className='space-y-0.5'>
              <Label className='text-xs font-semibold'>Visual Signature / Sign-off</Label>
              <p className='text-[11px] text-muted-foreground'>
                Appears at the footer of invoices, proposals, and receipts as an authorized signatory mark.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Signatory Full Name (Typed Cursive)</Label>
                <Input
                  value={form.signatureText || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      signatureText: e.target.value,
                      signatureType: 'text',
                    })
                  }
                  placeholder='e.g. Alex Morgan'
                  className='h-10 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Signature Preview</Label>
                <div className='h-12 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-center px-4'>
                  {form.signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.signatureUrl}
                      alt='Signature'
                      className='max-h-10 object-contain'
                    />
                  ) : (
                    <span className='font-serif italic text-lg sm:text-xl text-primary font-semibold tracking-wide'>
                      {form.signatureText || 'Authorized Signatory'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 text-xs relative cursor-pointer'
              >
                <IconWriting className='h-3.5 w-3.5 mr-1.5' />
                <span>Upload Signature Image</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleSignatureUpload}
                  className='absolute inset-0 opacity-0 cursor-pointer'
                />
              </Button>
              {form.signatureUrl && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setForm({ ...form, signatureUrl: '', signatureType: 'text' })}
                  className='h-8 text-xs text-rose-500'
                >
                  Switch to typed name
                </Button>
              )}
            </div>
          </div>

          {/* Brand Accent Color */}
          <div className='space-y-2'>
            <Label className='text-xs font-semibold'>Document Accent Color</Label>
            <div className='flex items-center gap-3'>
              <input
                type='color'
                value={form.brandColor || '#2563eb'}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className='h-9 w-12 rounded-lg border border-border/60 bg-background cursor-pointer p-0.5'
              />
              <span className='font-mono text-xs text-muted-foreground uppercase'>
                {form.brandColor || '#2563EB'}
              </span>
            </div>
          </div>

          <div className='pt-2 flex justify-end'>
            <Button type='submit' size='sm' className='h-9 text-xs gap-1.5 shadow-xs'>
              <IconDeviceFloppy className='h-4 w-4' />
              <span>Save Branding</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

