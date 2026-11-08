'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { QuotationStatusBadge } from './quotation-status-badge';
import { Quotation } from '../types/quotation.types';
import { downloadQuotationPdf } from '../pdf/pdf-actions-manager';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconSend,
  IconCopy,
  IconReceipt,
  IconTrash,
  IconCalendar,
  IconBuilding,
  IconDownload,
} from '@tabler/icons-react';

interface QuotationCardProps {
  quotation: Quotation;
  onSend: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onDuplicate: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
}

export const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  onSend,
  onConvert,
  onDuplicate,
  onDelete,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isAccepted = quotation.status === 'accepted';
  const isConverted = quotation.status === 'converted';

  return (
    <Card className='group relative rounded-xl border border-border/50 bg-card hover:border-border transition-all duration-200 hover:shadow-xs shadow-xs'>
      <CardContent className='p-5 space-y-3.5'>
        {/* Top Header: Quotation Number, Status & Dropdown Menu */}
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-1 flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-xs font-semibold text-muted-foreground'>
                {quotation.quotationNumber}
              </span>
              {quotation.version > 1 && (
                <span className='rounded px-1.5 py-0.2 text-[10px] font-semibold bg-muted text-muted-foreground font-mono'>
                  v{quotation.version}
                </span>
              )}
              <QuotationStatusBadge status={quotation.status} />
            </div>

            <Link
              href={`/dashboard/quotations/${quotation.quotationId}`}
              className='font-bold text-sm text-foreground hover:text-primary transition-colors truncate block'
            >
              {quotation.title}
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground shrink-0'
              >
                <IconDotsVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 text-xs'>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/quotations/${quotation.quotationId}`}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <IconEye className='h-4 w-4' />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => downloadQuotationPdf(quotation)}
                className='flex items-center gap-2 cursor-pointer'
              >
                <IconDownload className='h-4 w-4 text-primary' />
                <span>Download PDF</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/quotations/${quotation.quotationId}/edit`}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <IconEdit className='h-4 w-4' />
                  <span>Edit Proposal</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onSend(quotation)}
                className='flex items-center gap-2 cursor-pointer'
              >
                <IconSend className='h-4 w-4' />
                <span>Share Link</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDuplicate(quotation)}
                className='flex items-center gap-2 cursor-pointer'
              >
                <IconCopy className='h-4 w-4' />
                <span>Duplicate</span>
              </DropdownMenuItem>

              {!isConverted ? (
                <DropdownMenuItem
                  onClick={() => onConvert(quotation)}
                  className='flex items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400 font-medium'
                >
                  <IconReceipt className='h-4 w-4' />
                  <span>Convert to Invoice</span>
                </DropdownMenuItem>
              ) : quotation.invoiceId ? (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/invoices/${quotation.invoiceId}`}
                    className='flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 font-medium'
                  >
                    <IconReceipt className='h-4 w-4' />
                    <span>View Invoice</span>
                  </Link>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(quotation)}
                className='flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive'
              >
                <IconTrash className='h-4 w-4' />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client & Date Details */}
        <div className='space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40'>
          <div className='flex items-center gap-1.5 truncate'>
            <IconBuilding className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            <span className='font-medium text-foreground truncate'>
              {quotation.clientInfo?.name || 'Unknown Client'}
            </span>
            {quotation.clientInfo?.company && (
              <span className='truncate text-muted-foreground'>
                · {quotation.clientInfo.company}
              </span>
            )}
          </div>

          <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <IconCalendar className='h-3.5 w-3.5' />
              Valid till {formatDate(quotation.expiryDate)}
            </span>
            <span>{quotation.items?.length || 0} items</span>
          </div>
        </div>

        {/* Bottom Total Amount */}
        <div className='pt-2 flex items-baseline justify-between border-t border-border/40'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Total Amount
          </span>
          <span className='text-lg font-bold text-foreground tabular-nums'>
            {formatCurrency(quotation.totalAmount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
