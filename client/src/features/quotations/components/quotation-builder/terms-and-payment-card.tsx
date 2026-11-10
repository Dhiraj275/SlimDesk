'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { useSettings } from '@/features/settings/context/settings-context';
import { IconCreditCard, IconFileText, IconNotes, IconSparkles } from '@tabler/icons-react';

interface TermsAndPaymentCardProps {
  paymentSchedule: string;
  onPaymentScheduleChange: (val: string) => void;
  terms: string;
  onTermsChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

const PAYMENT_PRESETS = [
  '50% advance upon project confirmation, remaining 50% on final handover.',
  '100% advance payment required prior to kickoff.',
  '30% kickoff deposit, 40% on milestone beta delivery, 30% on completion.',
  'Monthly recurring retainer billed on the 1st of every month.',
];

export const TermsAndPaymentCard: React.FC<TermsAndPaymentCardProps> = ({
  paymentSchedule,
  onPaymentScheduleChange,
  terms,
  onTermsChange,
  notes,
  onNotesChange,
}) => {
  const { settings } = useSettings();
  const customSnippets = settings.snippets || [];
  return (
    <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
          <IconCreditCard className='h-4 w-4 text-primary' />
          Commercial Terms & Payment Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Payment Schedule */}
        <div className='space-y-2'>
          <Label className='text-xs font-medium'>Payment Schedule / Milestone Terms</Label>
          <div className='flex flex-wrap gap-1.5'>
            {PAYMENT_PRESETS.map((preset, i) => (
              <Badge
                key={i}
                variant='outline'
                onClick={() => onPaymentScheduleChange(preset)}
                className='cursor-pointer border-border/60 bg-muted/30 hover:bg-muted hover:text-foreground text-[11px] font-normal py-1 px-2.5 rounded-lg text-muted-foreground transition-colors'
              >
                {preset.slice(0, 36)}...
              </Badge>
            ))}
          </div>
          <Textarea
            rows={2}
            value={paymentSchedule}
            onChange={(e) => onPaymentScheduleChange(e.target.value)}
            placeholder='e.g. 50% upfront deposit before kickoff, 50% balance upon final staging approval.'
            className='text-xs resize-y'
          />
        </div>

        {/* Standard Terms & Conditions */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-medium'>Terms & Scope Conditions</Label>
            {customSnippets.filter((s) => s.category === 'terms' || s.category === 'revision_policy').length > 0 && (
              <div className='flex items-center gap-1 flex-wrap'>
                <span className='text-[10px] text-muted-foreground mr-1'>Library:</span>
                {customSnippets
                  .filter((s) => s.category === 'terms' || s.category === 'revision_policy')
                  .map((s) => (
                    <Badge
                      key={s.id}
                      variant='outline'
                      onClick={() => onTermsChange(s.content)}
                      className='cursor-pointer text-[10px] py-0 px-2 rounded hover:bg-muted font-normal'
                    >
                      {s.title}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
          <Textarea
            rows={3}
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder='Terms and deliverable bounds...'
            className='text-xs resize-y'
          />
        </div>

        {/* Internal / Client Notes */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-medium'>Client Notes / Footer Message (Optional)</Label>
            {customSnippets.filter((s) => s.category === 'notes').length > 0 && (
              <div className='flex items-center gap-1 flex-wrap'>
                {customSnippets
                  .filter((s) => s.category === 'notes')
                  .map((s) => (
                    <Badge
                      key={s.id}
                      variant='outline'
                      onClick={() => onNotesChange(s.content)}
                      className='cursor-pointer text-[10px] py-0 px-2 rounded hover:bg-muted font-normal'
                    >
                      {s.title}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder='e.g. Thank you for your partnership! Please reach out if you have any questions.'
            className='text-xs resize-y'
          />
        </div>
      </CardContent>
    </Card>
  );
};
