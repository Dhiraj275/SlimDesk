'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Invoice } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import { toast } from 'sonner';
import {
  IconSend,
  IconLoader2,
  IconCopy,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react';

interface SendInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedInvoice: Invoice) => void;
}

export const SendInvoiceDialog: React.FC<SendInvoiceDialogProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      setRecipientEmail(invoice.clientInfo?.email || '');
      setRecipientName(invoice.clientInfo?.name || '');
      setMessage(
        `Hi ${invoice.clientInfo?.name || 'there'},\n\nPlease find invoice ${invoice.invoiceNumber} for ${invoice.title || 'services rendered'}. You can view the payment details and invoice online using the secure link provided.\n\nThank you for your business!`
      );
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invoice/${invoice.publicToken}`
      : `/invoice/${invoice.publicToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public invoice link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      toast.error('Please enter the recipient email address');
      return;
    }

    setIsSending(true);
    try {
      const updated = await invoicesApi.sendInvoice(invoice.invoiceId, {
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim() || undefined,
        message: message.trim() || undefined,
      });

      toast.success(
        `Invoice ${invoice.invoiceNumber} successfully sent to ${recipientEmail}`
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch invoice');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-lg p-6 sm:p-7'>
        <form onSubmit={handleSend} className='space-y-4'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'>
                <IconSend className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='text-lg font-bold tracking-tight text-foreground'>
                  Send Invoice to Client
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Email invoice link and payment instructions for{' '}
                  <span className='font-mono font-semibold text-foreground'>
                    {invoice.invoiceNumber}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Quick Copy Link Box */}
          <div className='rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>
                Public Client Link
              </span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleCopyLink}
                className='h-7 text-xs gap-1 font-medium'
              >
                {copied ? (
                  <>
                    <IconCheck className='h-3.5 w-3.5 text-emerald-600' />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className='h-3.5 w-3.5' />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
            </div>
            <div className='p-2 rounded bg-background border border-border/40 font-mono text-[11px] text-muted-foreground truncate'>
              {publicUrl}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Recipient Name</Label>
                <Input
                  type='text'
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className='h-9 text-xs bg-card'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Recipient Email *</Label>
                <Input
                  type='email'
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className='h-9 text-xs bg-card'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Message</Label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='text-xs resize-none bg-card leading-relaxed'
              />
            </div>
          </div>

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isSending}
              className='h-9 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={isSending}
              className='h-9 text-xs font-medium gap-1.5'
            >
              {isSending ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <IconSend className='h-4 w-4' />
                  <span>Send Invoice</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
