'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Invoice } from '../types/invoice.types';
import { InvoicePdfDocument } from './invoice-pdf-document';
import { registerPdfFonts } from '@/features/quotations/pdf/pdf-fonts';
import { toast } from 'sonner';

/**
 * Creates a downloadable filename for the invoice.
 */
export const getInvoiceFileName = (
  invoice: Invoice,
  extension: 'pdf' | 'png' = 'pdf'
): string => {
  const cleanNumber = (invoice.invoiceNumber || 'INV').replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );
  const clientName = invoice.clientInfo?.name
    ? `_${invoice.clientInfo.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : '';
  return `Invoice_${cleanNumber}${clientName}.${extension}`;
};

/**
 * Triggers a file download in the browser.
 */
export const triggerDownload = (url: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

/**
 * Renders the InvoicePdfDocument to a vector PDF Blob.
 */
export const generateInvoicePdfBlob = async (
  invoice: Invoice
): Promise<Blob> => {
  registerPdfFonts();
  const doc = <InvoicePdfDocument invoice={invoice} />;
  return await pdf(doc).toBlob();
};

/**
 * Directly downloads the high-quality vector PDF.
 */
export const downloadInvoicePdf = async (invoice: Invoice): Promise<void> => {
  const toastId = toast.loading('Generating vector PDF invoice...');
  try {
    const blob = await generateInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);
    const fileName = getInvoiceFileName(invoice, 'pdf');

    triggerDownload(url, fileName);
    toast.success('Invoice PDF downloaded successfully', { id: toastId });

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } catch (error: any) {
    console.error('Failed to download invoice PDF:', error);
    toast.error(error?.message || 'Failed to generate PDF. Please try again.', {
      id: toastId,
    });
    throw error;
  }
};

/**
 * Opens the high-quality vector PDF in a new browser tab for preview/inspection.
 */
export const openInvoicePdfInNewTab = async (
  invoice: Invoice
): Promise<void> => {
  const toastId = toast.loading('Preparing PDF preview...');
  try {
    const blob = await generateInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.dismiss(toastId);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error: any) {
    console.error('Failed to open invoice PDF:', error);
    toast.error(error?.message || 'Failed to open PDF in preview.', {
      id: toastId,
    });
    throw error;
  }
};

/**
 * Prints the invoice PDF directly via a hidden iframe.
 */
export const printInvoicePdf = async (invoice: Invoice): Promise<void> => {
  const toastId = toast.loading('Preparing document for print...');
  try {
    const blob = await generateInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      toast.dismiss(toastId);
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(url, '_blank');
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 30000);
        }
      }, 500);
    };
  } catch (error: any) {
    console.error('Failed to print invoice PDF:', error);
    toast.error(error?.message || 'Failed to print PDF.', {
      id: toastId,
    });
    throw error;
  }
};

