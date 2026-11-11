'use client';

import React, { useState } from 'react';
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
import { Quotation } from '../types/quotation.types';
import { quotationsApi } from '../api/quotations.api';
import { toast } from 'sonner';
import {
  IconSend,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconWorld,
  IconLoader2,
} from '@tabler/icons-react';

interface SendQuotationDialogProps {
  quotation: Quotation | null;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess: (updated: Quotation) => void;
}

export const SendQuotationDialog: React.FC<SendQuotationDialogProps> = ({
  quotation,
  isOpen,
  open,
  onClose,
  onOpenChange,
  onSuccess,
}) => {
  const isModalOpen = open ?? isOpen ?? false;
  const handleModalClose = (val: boolean) => {
    if (!val) {
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    }
  };

  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(
    quotation?.clientInfo?.email || ''
  );
  const [message, setMessage] = useState(
    `Hi ${quotation?.clientInfo?.name || 'there'},\n\nPlease find attached the commercial quotation for ${
      quotation?.title || 'our proposed project'
    }. You can review scope, line items, and approve it directly via the secure portal link below.\n\nBest regards,\n${
      quotation?.freelancerInfo?.name || ''
    }`
  );
  const [sending, setSending] = useState(false);

  if (!quotation) return null;

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/quote/${quotation.publicToken}`
      : `/quote/${quotation.publicToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Public review link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleMarkAsSent = async () => {
    setSending(true);
    try {
      const updated = await quotationsApi.sendQuotation(
        quotation.quotationId,
        {
          recipientEmail: recipientEmail.trim() || undefined,
          message: message.trim() || undefined,
        }
      );
      toast.success(
        `Quotation ${quotation.quotationNumber} marked as Sent`
      );
      onSuccess(updated);
      handleModalClose(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update quotation status');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className='sm:max-w-lg p-6 sm:p-7'>
        <DialogHeader className='space-y-2 pb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20'>
              <IconSend className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                Share Proposal
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Send quotation {quotation.quotationNumber} directly to client or share a link.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4 pt-1'>
          {/* Public Link Copy Box */}
          <div className='space-y-2'>
            <Label className='text-xs font-medium'>Client Review Link</Label>
            <div className='flex gap-2'>
              <Input
                readOnly
                value={publicUrl}
                className='font-mono text-xs bg-muted/40 h-10'
              />
              <Button
                type='button'
                variant='outline'
                onClick={handleCopyLink}
                className='h-10 px-3.5 gap-1.5 shrink-0'
              >
                {copied ? (
                  <>
                    <IconCheck className='h-4 w-4 text-emerald-600' />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className='h-4 w-4' />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className='flex items-center justify-between text-[11px] text-muted-foreground px-0.5'>
              <span className='flex items-center gap-1'>
                <IconWorld className='h-3 w-3' />
                Passwordless secure review portal
              </span>
              <a
                href={publicUrl}
                target='_blank'
                rel='noreferrer'
                className='text-primary hover:underline flex items-center gap-1 font-medium'
              >
                Preview portal <IconExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>

          {/* Email Recipient */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>Recipient Email Address</Label>
            <Input
              type='email'
              placeholder='client@example.com'
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className='h-10'
            />
          </div>

          {/* Optional Message */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>Transmittal Note</Label>
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Add a personalized message...'
              className='text-xs resize-y'
            />
          </div>
        </div>

        <DialogFooter className='pt-2 gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleModalClose(false)}
            disabled={sending}
            className='h-10 px-5'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleMarkAsSent}
            disabled={sending}
            className='h-10 px-5 font-semibold shadow-xs'
          >
            {sending ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              <>
                <IconSend className='mr-2 h-4 w-4' />
                Mark as Sent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
