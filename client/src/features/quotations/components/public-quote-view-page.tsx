'use client';

import React, { useState } from 'react';
import { QuotationDocument } from './quotation-preview/quotation-document';
import { PdfActionsMenu } from '../pdf/pdf-actions-menu';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { quotationsApi } from '../api/quotations.api';
import { Quotation } from '../types/quotation.types';
import { toast } from 'sonner';
import {
  IconCheck,
  IconX,
  IconPrinter,
  IconLoader2,
  IconFileCheck,
} from '@tabler/icons-react';

interface PublicQuoteViewPageProps {
  initialQuotation: Quotation;
  token: string;
}

export const PublicQuoteViewPage: React.FC<PublicQuoteViewPageProps> = ({
  initialQuotation,
  token,
}) => {
  const [quotation, setQuotation] = useState<Quotation>(initialQuotation);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Acceptance form states
  const [clientName, setClientName] = useState(
    quotation.clientInfo?.name || ''
  );
  const [clientEmail, setClientEmail] = useState(
    quotation.clientInfo?.email || ''
  );
  const [comments, setComments] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject form states
  const [rejectionReason, setRejectionReason] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast.error('Please enter your name and email to accept this quotation.');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please accept the quotation terms to confirm.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await quotationsApi.acceptPublicQuotation(token, {
        name: clientName.trim(),
        email: clientEmail.trim(),
        comments: comments.trim() || undefined,
      });
      setQuotation(updated);
      setIsAcceptOpen(false);
      toast.success('Thank you! Quotation accepted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please share a reason for declining this quotation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await quotationsApi.rejectPublicQuotation(token, {
        reason: rejectionReason.trim(),
      });
      setQuotation(updated);
      setIsRejectOpen(false);
      toast.success('Quotation has been declined.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAcceptOrReject =
    quotation.status === 'sent' || quotation.status === 'viewed';

  return (
    <div className='min-h-screen bg-background py-8 px-4 sm:px-6'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Top Banner / Actions Bar */}
        <div className='bg-card border border-border/50 rounded-xl p-5 shadow-xs print:hidden'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs uppercase font-semibold tracking-wider text-muted-foreground'>
                  Commercial Quotation
                </span>
                <span className='font-mono text-xs font-semibold text-foreground'>
                  {quotation.quotationNumber}
                </span>
              </div>
              <h1 className='text-xl font-bold tracking-tight text-foreground mt-0.5'>
                {quotation.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-2.5 self-stretch sm:self-auto'>
              <PdfActionsMenu quotation={quotation} />

              {canAcceptOrReject && (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsRejectOpen(true)}
                    className='h-9 text-xs text-muted-foreground hover:text-destructive'
                  >
                    Decline
                  </Button>

                  <Button
                    type='button'
                    size='sm'
                    onClick={() => setIsAcceptOpen(true)}
                    className='h-9 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 shadow-xs'
                  >
                    <IconCheck className='h-4 w-4 stroke-[2.5]' />
                    <span>Accept Quotation</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status Banners */}
          {quotation.status === 'accepted' && (
            <div className='mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300'>
              <IconCheck className='h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[3]' />
              <span>
                <strong>Quotation Accepted!</strong> You approved this proposal on{' '}
                {new Date(quotation.acceptedAt!).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}. The freelancer has been notified.
              </span>
            </div>
          )}

          {quotation.status === 'rejected' && (
            <div className='mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300'>
              <IconX className='h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 stroke-[3]' />
              <span>
                <strong>Quotation Declined.</strong> You rejected this quotation offer on{' '}
                {new Date(quotation.rejectedAt!).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}.
              </span>
            </div>
          )}
        </div>

        {/* The Formal Document */}
        <QuotationDocument quotation={quotation} />
      </div>

      {/* Accept Dialog */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className='sm:max-w-md p-6 sm:p-7'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                <IconCheck className='h-5 w-5 stroke-[2.5]' />
              </div>
              <div>
                <DialogTitle className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                  Accept Proposal
                </DialogTitle>
                <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                  Confirm quotation {quotation.quotationNumber} to initiate work.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4 pt-1'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Your Full Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder='e.g. Rajesh Sharma'
                className='h-10'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Your Email Address</Label>
              <Input
                type='email'
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder='rajesh@example.com'
                className='h-10'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Acceptance Notes (Optional)</Label>
              <Textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder='e.g. Approved. Please share the advance payment invoice.'
                className='text-xs resize-y'
              />
            </div>

            <div className='flex items-start space-x-2 pt-1'>
              <Checkbox
                id='terms'
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                className='mt-0.5'
              />
              <label
                htmlFor='terms'
                className='text-xs text-muted-foreground leading-normal cursor-pointer select-none'
              >
                I confirm that I have reviewed the deliverables, timeline milestones, and terms outlined in this quotation.
              </label>
            </div>
          </div>

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsAcceptOpen(false)}
              disabled={isSubmitting}
              className='h-10 px-5'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleAccept}
              disabled={isSubmitting || !agreedToTerms}
              className='h-10 px-5 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600'
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Confirming...
                </>
              ) : (
                <>
                  <IconCheck className='mr-2 h-4 w-4 stroke-[3]' />
                  Confirm & Accept
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className='sm:max-w-md p-6 sm:p-7'>
          <DialogHeader className='space-y-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'>
                <IconX className='h-5 w-5 stroke-[2.5]' />
              </div>
              <div>
                <DialogTitle className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                  Decline Quotation
                </DialogTitle>
                <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                  Provide feedback to the service provider.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-3 pt-1'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Reason for Declining</Label>
              <Textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder='e.g. Budget constraints, project postponed, scope adjustments needed...'
                className='text-xs resize-y'
                required
              />
            </div>
          </div>

          <DialogFooter className='pt-2 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsRejectOpen(false)}
              disabled={isSubmitting}
              className='h-10 px-5'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleReject}
              disabled={isSubmitting}
              className='h-10 px-5 font-semibold shadow-xs'
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Confirm Decline'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
