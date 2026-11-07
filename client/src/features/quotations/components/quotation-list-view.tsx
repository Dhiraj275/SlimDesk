'use client';

import React from 'react';
import Link from 'next/link';
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
  IconFileInvoice,
  IconPlus,
  IconDownload,
} from '@tabler/icons-react';

interface QuotationListViewProps {
  quotations: Quotation[];
  onSend: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onDuplicate: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  onNewQuotationClick?: () => void;
}

export const QuotationListView: React.FC<QuotationListViewProps> = ({
  quotations,
  onSend,
  onConvert,
  onDuplicate,
  onDelete,
  onNewQuotationClick,
}) => {
  const formatCurrency = (val: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
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

  if (quotations.length === 0) {
    return (
      <div className='flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center bg-card/40'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4'>
          <IconFileInvoice className='h-6 w-6 opacity-60' />
        </div>
        <h3 className='text-base font-semibold text-foreground'>No quotations found</h3>
        <p className='text-sm text-muted-foreground max-w-sm mt-1 mb-4'>
          No commercial proposals match your filter criteria or you haven't drafted a quotation yet.
        </p>
        <Button asChild size='sm' className='gap-1.5'>
          <Link href='/dashboard/quotations/new'>
            <IconPlus className='h-4 w-4' />
            Create First Quotation
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs w-full min-w-0 max-w-full'>
      <div className='overflow-x-auto custom-scrollbar pb-1'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              <th className='py-3.5 pl-4 pr-3 sm:pl-6'>Quotation #</th>
              <th className='px-3 py-3.5'>Client / Company</th>
              <th className='px-3 py-3.5'>Subject / Deliverable</th>
              <th className='px-3 py-3.5'>Valid Till</th>
              <th className='px-3 py-3.5 text-right'>Total Amount</th>
              <th className='px-3 py-3.5 text-center'>Status</th>
              <th className='py-3.5 pl-3 pr-4 text-right sm:pr-6'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {quotations.map((q) => {
              const isAccepted = q.status === 'accepted';
              const isConverted = q.status === 'converted';

              return (
                <tr
                  key={q.quotationId}
                  className='hover:bg-muted/30 transition-colors group'
                >
                  {/* Quotation Number */}
                  <td className='py-3.5 pl-4 pr-3 sm:pl-6'>
                    <div className='flex items-center gap-1.5 font-mono'>
                      <Link
                        href={`/dashboard/quotations/${q.quotationId}`}
                        className='font-semibold text-foreground hover:text-primary transition-colors hover:underline'
                      >
                        {q.quotationNumber}
                      </Link>
                      {q.version > 1 && (
                        <span className='rounded px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground'>
                          v{q.version}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Client Info */}
                  <td className='px-3 py-3.5'>
                    <div className='flex flex-col'>
                      <span className='font-medium text-foreground'>
                        {q.clientInfo?.name || 'Unknown Client'}
                      </span>
                      {q.clientInfo?.company && (
                        <span className='text-xs text-muted-foreground'>
                          {q.clientInfo.company}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title / Deliverable */}
                  <td className='px-3 py-3.5 max-w-xs'>
                    <span className='truncate block font-medium text-foreground text-xs sm:text-sm' title={q.title}>
                      {q.title}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {q.items?.length || 0} line {q.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  {/* Expiry Date */}
                  <td className='px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap'>
                    {formatDate(q.expiryDate)}
                  </td>

                  {/* Amount */}
                  <td className='px-3 py-3.5 text-right whitespace-nowrap'>
                    <span className='font-semibold text-foreground tabular-nums'>
                      {formatCurrency(q.totalAmount, q.currency)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className='px-3 py-3.5 text-center whitespace-nowrap'>
                    <QuotationStatusBadge status={q.status} />
                  </td>

                  {/* Actions Dropdown */}
                  <td className='py-3.5 pl-3 pr-4 text-right sm:pr-6 whitespace-nowrap'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        >
                          <IconDotsVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48 text-xs'>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/quotations/${q.quotationId}`}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <IconEye className='h-4 w-4' />
                            <span>View Proposal</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => downloadQuotationPdf(q)}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <IconDownload className='h-4 w-4 text-primary' />
                          <span>Download PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/quotations/${q.quotationId}/edit`}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <IconEdit className='h-4 w-4' />
                            <span>Edit Quotation</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onSend(q)}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <IconSend className='h-4 w-4' />
                          <span>Share / Send</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onDuplicate(q)}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <IconCopy className='h-4 w-4' />
                          <span>Duplicate</span>
                        </DropdownMenuItem>

                        {isAccepted && !isConverted && (
                          <DropdownMenuItem
                            onClick={() => onConvert(q)}
                            className='flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium'
                          >
                            <IconReceipt className='h-4 w-4' />
                            <span>Convert to Invoice</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onDelete(q)}
                          className='flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive'
                        >
                          <IconTrash className='h-4 w-4' />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
