'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Quotation } from '../types/quotation.types';
import { QuotationPdfDocument } from './quotation-pdf-document';
import { registerPdfFonts } from './pdf-fonts';
import { toast } from 'sonner';

/**
 * Creates a downloadable filename for the quotation.
 */
export const getQuotationFileName = (
  quotation: Quotation,
  extension: 'pdf' | 'png' = 'pdf'
): string => {
  const cleanNumber = (quotation.quotationNumber || 'QT').replace(/[^a-zA-Z0-9_-]/g, '_');
  const clientName = quotation.clientInfo?.name
    ? `_${quotation.clientInfo.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : '';
  return `Quotation_${cleanNumber}${clientName}.${extension}`;
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
 * Renders the QuotationPdfDocument to a vector PDF Blob.
 */
export const generateQuotationPdfBlob = async (
  quotation: Quotation
): Promise<Blob> => {
  registerPdfFonts();
  const doc = <QuotationPdfDocument quotation={quotation} />;
  return await pdf(doc).toBlob();
};

/**
 * Directly downloads the high-quality vector PDF.
 */
export const downloadQuotationPdf = async (
  quotation: Quotation
): Promise<void> => {
  const toastId = toast.loading('Generating vector PDF proposal...');
  try {
    const blob = await generateQuotationPdfBlob(quotation);
    const url = URL.createObjectURL(blob);
    const fileName = getQuotationFileName(quotation, 'pdf');

    triggerDownload(url, fileName);
    toast.success('Quotation PDF downloaded successfully', { id: toastId });

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } catch (error: any) {
    console.error('Failed to download quotation PDF:', error);
    toast.error(error?.message || 'Failed to generate PDF. Please try again.', {
      id: toastId,
    });
    throw error;
  }
};

/**
 * Opens the high-quality vector PDF in a new browser tab for preview/inspection.
 */
export const openQuotationPdfInNewTab = async (
  quotation: Quotation
): Promise<void> => {
  const toastId = toast.loading('Preparing PDF preview...');
  try {
    const blob = await generateQuotationPdfBlob(quotation);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.dismiss(toastId);

    // Keep URL alive briefly so the new tab can load it
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error: any) {
    console.error('Failed to open quotation PDF:', error);
    toast.error(error?.message || 'Failed to open PDF in preview.', {
      id: toastId,
    });
    throw error;
  }
};

/**
 * Native vector PDF print without page clipping or browser header/footer clutter.
 */
export const printQuotationPdf = async (
  quotation: Quotation
): Promise<void> => {
  const toastId = toast.loading('Preparing document for printing...');
  try {
    const blob = await generateQuotationPdfBlob(quotation);
    const url = URL.createObjectURL(blob);

    // Create a hidden iframe for pristine vector printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          toast.dismiss(toastId);
        } catch {
          // Fallback to window.open if iframe printing is blocked
          window.open(url, '_blank');
          toast.dismiss(toastId);
        }

        // Cleanup iframe after printing completes
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 120000);
      }, 500);
    };
  } catch (error: any) {
    console.error('Failed to print quotation PDF:', error);
    toast.error(error?.message || 'Failed to print document.', {
      id: toastId,
    });
    throw error;
  }
};

/**
 * Converts page 1 of the vector PDF to a high-resolution 2x retina PNG image.
 */
export const downloadQuotationPng = async (
  quotation: Quotation,
  scale: number = 2
): Promise<void> => {
  const toastId = toast.loading('Rendering high-resolution image...');
  let pdfUrl = '';

  try {
    const pdfBlob = await generateQuotationPdfBlob(quotation);
    pdfUrl = URL.createObjectURL(pdfBlob);

    // Dynamic import to avoid SSR bundling
    const pdfjs = await import('pdfjs-dist');

    if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    await (page.render(renderContext as any) as any).promise;

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to image blob'));
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        const fileName = getQuotationFileName(quotation, 'png');
        triggerDownload(pngUrl, fileName);

        toast.success('High-resolution PNG image downloaded', { id: toastId });

        setTimeout(() => {
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 5000);
      }, 'image/png');
    });
  } catch (error: any) {
    console.error('Failed to download quotation PNG:', error);
    toast.error(error?.message || 'Failed to render image. You can still download the PDF.', {
      id: toastId,
    });
    throw error;
  } finally {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  }
};
