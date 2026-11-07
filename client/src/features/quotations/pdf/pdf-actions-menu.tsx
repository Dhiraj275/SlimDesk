'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Quotation } from '../types/quotation.types';
import {
  downloadQuotationPdf,
  downloadQuotationPng,
  openQuotationPdfInNewTab,
  printQuotationPdf,
} from './pdf-actions-manager';
import {
  IconDownload,
  IconPrinter,
  IconExternalLink,
  IconPhoto,
  IconChevronDown,
  IconLoader2,
  IconFileInvoice,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface PdfActionsMenuProps {
  quotation: Quotation | null;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showSplitButton?: boolean;
}

export const PdfActionsMenu: React.FC<PdfActionsMenuProps> = ({
  quotation,
  className,
  variant = 'outline',
  size = 'sm',
  showSplitButton = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!quotation) return null;

  const handleAction = async (action: 'pdf' | 'png' | 'preview' | 'print') => {
    if (isGenerating) return;
    setIsGenerating(true);
    setActiveAction(action);

    try {
      if (action === 'pdf') {
        await downloadQuotationPdf(quotation);
      } else if (action === 'png') {
        await downloadQuotationPng(quotation);
      } else if (action === 'preview') {
        await openQuotationPdfInNewTab(quotation);
      } else if (action === 'print') {
        await printQuotationPdf(quotation);
      }
    } catch {
      // Errors are toasted inside the manager
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  return (
    <div className={cn('inline-flex items-center rounded-lg shadow-2xs', className)}>
      {/* Primary Action Button: Direct PDF Download */}
      <Button
        variant={variant}
        size={size}
        onClick={() => handleAction('pdf')}
        disabled={isGenerating}
        className={cn(
          'gap-1.5 font-medium text-xs h-9',
          showSplitButton && 'rounded-r-none border-r-0'
        )}
      >
        {isGenerating && activeAction === 'pdf' ? (
          <IconLoader2 className='h-4 w-4 animate-spin' />
        ) : (
          <IconDownload className='h-4 w-4 text-primary' />
        )}
        <span>Download PDF</span>
      </Button>

      {/* Dropdown for More Options (PNG, Print, Preview) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isGenerating}
            className={cn(
              'px-2 h-9 text-xs',
              showSplitButton && 'rounded-l-none'
            )}
            aria-label='More PDF export options'
          >
            {isGenerating && activeAction !== 'pdf' ? (
              <IconLoader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <IconChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-48 text-xs'>
          <DropdownMenuItem
            onClick={() => handleAction('pdf')}
            disabled={isGenerating}
            className='gap-2 py-2 cursor-pointer'
          >
            <IconFileInvoice className='h-4 w-4 text-primary' />
            <span>Download Vector PDF</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction('png')}
            disabled={isGenerating}
            className='gap-2 py-2 cursor-pointer'
          >
            <IconPhoto className='h-4 w-4 text-sky-600 dark:text-sky-400' />
            <span>Export Image (PNG)</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleAction('preview')}
            disabled={isGenerating}
            className='gap-2 py-2 cursor-pointer'
          >
            <IconExternalLink className='h-4 w-4 text-muted-foreground' />
            <span>Open PDF in New Tab</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction('print')}
            disabled={isGenerating}
            className='gap-2 py-2 cursor-pointer'
          >
            <IconPrinter className='h-4 w-4 text-muted-foreground' />
            <span>Print Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

