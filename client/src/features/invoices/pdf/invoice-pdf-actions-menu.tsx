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
import { Invoice } from '../types/invoice.types';
import {
  downloadInvoicePdf,
  openInvoicePdfInNewTab,
  printInvoicePdf,
} from './invoice-pdf-actions-manager';
import {
  IconDownload,
  IconPrinter,
  IconExternalLink,
  IconChevronDown,
  IconLoader2,
  IconLink,
  IconCheck,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/utils';

interface InvoicePdfActionsMenuProps {
  invoice: Invoice | null;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showSplitButton?: boolean;
}

export const InvoicePdfActionsMenu: React.FC<InvoicePdfActionsMenuProps> = ({
  invoice,
  className,
  variant = 'outline',
  size = 'sm',
  showSplitButton = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const handleAction = async (action: 'pdf' | 'preview' | 'print') => {
    if (isGenerating) return;
    setIsGenerating(true);
    setActiveAction(action);

    try {
      if (action === 'pdf') {
        await downloadInvoicePdf(invoice);
      } else if (action === 'preview') {
        await openInvoicePdfInNewTab(invoice);
      } else if (action === 'print') {
        await printInvoicePdf(invoice);
      }
    } catch {
      // Errors handled in manager
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  const handleCopyLink = () => {
    const publicUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/invoice/${invoice.publicToken}`
        : `/invoice/${invoice.publicToken}`;

    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success('Public invoice link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
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

      {/* Dropdown for More Options (Print, Preview, Copy Link) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isGenerating}
            className={cn(
              'px-2 h-9',
              showSplitButton && 'rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0'
            )}
            aria-label='More export options'
          >
            <IconChevronDown className='h-3.5 w-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48 text-xs'>
          <DropdownMenuItem
            onClick={() => handleAction('preview')}
            disabled={isGenerating}
            className='flex items-center gap-2 cursor-pointer'
          >
            <IconExternalLink className='h-3.5 w-3.5 text-muted-foreground' />
            <span>Open in New Tab</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAction('print')}
            disabled={isGenerating}
            className='flex items-center gap-2 cursor-pointer'
          >
            <IconPrinter className='h-3.5 w-3.5 text-muted-foreground' />
            <span>Print Invoice</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleCopyLink}
            className='flex items-center gap-2 cursor-pointer'
          >
            {copiedLink ? (
              <>
                <IconCheck className='h-3.5 w-3.5 text-emerald-600' />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <IconLink className='h-3.5 w-3.5 text-muted-foreground' />
                <span>Copy Public Link</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

