'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { InvoiceLineItemsEditor } from './invoice-line-items-editor';
import { InvoiceDocument } from '../invoice-preview/invoice-document';
import { calculateInvoiceSummary, FormInvoiceItemInput } from '../../utils/invoice-calc';
import { invoicesApi } from '../../api/invoices.api';
import { contactsApi } from '@/features/contacts/api/contacts.api';
import { Contact } from '@/features/contacts/types/contact.types';
import {
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  TaxMode,
  PartyInfo,
} from '../../types/invoice.types';
import { toast } from 'sonner';
import {
  IconReceipt2,
  IconEye,
  IconEdit,
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconBuilding,
  IconLoader2,
  IconCheck,
  IconSend,
  IconCreditCard,
} from '@tabler/icons-react';
import { cn } from '@/shared/utils/utils';

interface InvoiceFormProps {
  initialData?: Invoice;
  initialContactId?: string;
  initialQuotationId?: string;
  initialTitle?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  initialContactId,
  initialQuotationId,
  initialTitle,
}) => {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form states
  const [title, setTitle] = useState(
    initialData?.title || initialTitle || 'Website Redesign & Development Services'
  );
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
  );
  const [taxMode, setTaxMode] = useState<TaxMode>(
    initialData?.taxMode || 'none'
  );
  const [overallDiscount, setOverallDiscount] = useState<number>(
    initialData?.discountAmount || 0
  );

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialData?.contactId || initialContactId || ''
  );

  // Parties info
  const [freelancerInfo, setFreelancerInfo] = useState<PartyInfo>({
    name: initialData?.freelancerInfo?.name || 'SlimDesk Studio',
    businessName: initialData?.freelancerInfo?.businessName || '',
    email: initialData?.freelancerInfo?.email || 'hello@example.com',
    phone: initialData?.freelancerInfo?.phone || '+91 98765 43210',
    address: initialData?.freelancerInfo?.address || 'Mumbai, Maharashtra, India',
    gstin: initialData?.freelancerInfo?.gstin || '',
    state: initialData?.freelancerInfo?.state || 'Maharashtra',
  });

  const [clientInfo, setClientInfo] = useState<PartyInfo>({
    name: initialData?.clientInfo?.name || '',
    company: initialData?.clientInfo?.company || '',
    email: initialData?.clientInfo?.email || '',
    phone: initialData?.clientInfo?.phone || '',
    address: initialData?.clientInfo?.address || '',
    gstin: initialData?.clientInfo?.gstin || '',
    state: initialData?.clientInfo?.state || 'Maharashtra',
  });

  // Items
  const [items, setItems] = useState<FormInvoiceItemInput[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        discountAmount: it.discountAmount,
        taxRate: it.taxRate,
        sortOrder: it.sortOrder ?? idx,
      }));
    }
    return [
      {
        description: 'UI/UX Design & High-Fidelity Wireframes',
        quantity: 1,
        unit: 'units',
        unitPrice: 15000,
        discountAmount: 0,
        taxRate: 18,
        sortOrder: 0,
      },
      {
        description: 'Frontend Development & Responsive Integration',
        quantity: 1,
        unit: 'units',
        unitPrice: 25000,
        discountAmount: 0,
        taxRate: 18,
        sortOrder: 1,
      },
    ];
  });

  // Payment details, Terms & Notes
  const [paymentDetails, setPaymentDetails] = useState(
    initialData?.paymentDetails ||
      'Bank: HDFC Bank\nA/C No: 50100012345678\nIFSC: HDFC0001234\nUPI ID: freelancer@upi'
  );
  const [terms, setTerms] = useState(
    initialData?.terms ||
      'Payment due within 14 days of invoice issuance. Late payments incur 1.5% interest per month.'
  );
  const [notes, setNotes] = useState(
    initialData?.notes ||
      'Thank you for your business! Please include the invoice number in your payment transfer remarks.'
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch contacts for client dropdown
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await contactsApi.getContacts();
        setContacts(res || []);
      } catch (err) {
        console.error('Failed to load contacts for invoice:', err);
      }
    };
    loadContacts();
  }, []);

  // When contact is selected from dropdown, populate clientInfo
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const found = contacts.find((c) => c.contactId === contactId);
    if (found) {
      setClientInfo({
        name: found.name || '',
        company: found.company || '',
        email: found.email || '',
        phone: found.phone || '',
        address: '',
        gstin: '',
        state: 'Maharashtra',
      });
    }
  };

  // Live calculation summary
  const summary = useMemo(() => {
    return calculateInvoiceSummary(
      items,
      taxMode,
      overallDiscount,
      freelancerInfo.state,
      clientInfo.state
    );
  }, [items, taxMode, overallDiscount, freelancerInfo.state, clientInfo.state]);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // Save draft invoice
  const handleSave = async (autoIssue: boolean = false) => {
    if (!title.trim()) {
      toast.error('Please enter an invoice title');
      return;
    }

    if (!clientInfo.name.trim()) {
      toast.error('Please specify client name');
      return;
    }

    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      toast.error('Please add at least one line item with a description');
      return;
    }

    setIsSaving(true);
    try {
      const itemsPayload = summary.items.map((it, idx) => ({
        description: it.description.trim(),
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        discountAmount: it.discountAmount,
        taxRate: it.taxRate,
        sortOrder: it.sortOrder ?? idx,
      }));

      let saved: Invoice;

      if (isEditing && initialData) {
        saved = await invoicesApi.updateInvoice(initialData.invoiceId, {
          title: title.trim(),
          contactId: selectedContactId || undefined,
          currency,
          issueDate,
          dueDate,
          taxMode,
          discountAmount: summary.discountAmount,
          freelancerInfo,
          clientInfo,
          paymentDetails: paymentDetails.trim() || undefined,
          terms: terms.trim() || undefined,
          notes: notes.trim() || undefined,
          items: itemsPayload,
        });
        toast.success(`Invoice ${saved.invoiceNumber} updated successfully`);
      } else {
        const payload: CreateInvoicePayload = {
          title: title.trim(),
          contactId: selectedContactId || undefined,
          quotationId: initialQuotationId || undefined,
          currency,
          issueDate,
          dueDate,
          taxMode,
          discountAmount: summary.discountAmount,
          freelancerInfo,
          clientInfo,
          paymentDetails: paymentDetails.trim() || undefined,
          terms: terms.trim() || undefined,
          notes: notes.trim() || undefined,
          items: itemsPayload,
        };
        saved = await invoicesApi.createInvoice(payload);
        toast.success(`Draft Invoice ${saved.invoiceNumber} created`);
      }

      if (autoIssue && saved.status === 'draft') {
        saved = await invoicesApi.issueInvoice(saved.invoiceId);
        toast.success(`Invoice ${saved.invoiceNumber} finalized and issued`);
      }

      router.push(`/dashboard/invoices/${saved.invoiceId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6 pb-16'>
      {/* Top Action Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => router.push('/dashboard/invoices')}
            className='h-9 w-9 text-muted-foreground hover:text-foreground'
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                {isEditing ? `Edit ${initialData?.invoiceNumber}` : 'Create New Invoice'}
              </h1>
              <span className='px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold border border-blue-500/20'>
                {isEditing ? initialData?.status : 'Draft'}
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Specify client billing details, deliverables, payment terms, and bank instructions.
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs Toggle */}
        <div className='flex items-center gap-2 self-end sm:self-auto'>
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'editor' | 'preview')}
          >
            <TabsList className='h-9 p-0.5 bg-muted/50'>
              <TabsTrigger value='editor' className='text-xs gap-1.5 h-8'>
                <IconEdit className='h-3.5 w-3.5' />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value='preview' className='text-xs gap-1.5 h-8'>
                <IconEye className='h-3.5 w-3.5' />
                <span>Document Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className='h-9 text-xs gap-1.5 font-medium shadow-2xs'
          >
            {isSaving ? (
              <IconLoader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <IconDeviceFloppy className='h-3.5 w-3.5' />
            )}
            <span>Save Draft</span>
          </Button>

          <Button
            type='button'
            size='sm'
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className='h-9 text-xs gap-1.5 font-medium shadow-2xs bg-blue-600 hover:bg-blue-700 text-white'
          >
            <IconCheck className='h-3.5 w-3.5' />
            <span>Finalize & Issue</span>
          </Button>
        </div>
      </div>

      {/* Main Content: Tab View */}
      {activeTab === 'preview' ? (
        <div className='py-4'>
          <InvoiceDocument
            invoice={{
              invoiceNumber: initialData?.invoiceNumber || 'INV-2026-DRAFT',
              title,
              status: initialData?.status || 'draft',
              paymentStatus: initialData?.paymentStatus || 'unpaid',
              isOverdue: false,
              currency,
              issueDate,
              dueDate,
              items: summary.items,
              subtotal: summary.subtotal,
              discountAmount: summary.discountAmount,
              taxAmount: summary.taxAmount,
              totalAmount: summary.totalAmount,
              paidAmount: initialData?.paidAmount || 0,
              outstandingAmount: summary.totalAmount - (initialData?.paidAmount || 0),
              taxMode,
              taxDetails: summary.taxDetails,
              freelancerInfo,
              clientInfo,
              paymentDetails,
              terms,
              notes,
            }}
          />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left 2 Cols: Main Editor */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Project / Subject & Basic Details */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 sm:px-6 border-b border-border/40'>
                <CardTitle className='text-sm sm:text-base font-bold text-foreground'>
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 sm:p-6 space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>
                    Project Subject / Title *
                  </Label>
                  <Input
                    type='text'
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. Website Redesign & Frontend Development'
                    className='h-9 text-xs sm:text-sm font-medium bg-background'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className='h-9 text-xs bg-background font-mono'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='INR'>INR (₹) - Indian Rupee</SelectItem>
                        <SelectItem value='USD'>USD ($) - US Dollar</SelectItem>
                        <SelectItem value='EUR'>EUR (€) - Euro</SelectItem>
                        <SelectItem value='GBP'>GBP (£) - British Pound</SelectItem>
                        <SelectItem value='AED'>AED - UAE Dirham</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Invoice Date *</Label>
                    <Input
                      type='date'
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className='h-9 text-xs bg-background'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Payment Due Date *</Label>
                    <Input
                      type='date'
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className='h-9 text-xs bg-background'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Selection & Information */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 sm:px-6 flex flex-row items-center justify-between border-b border-border/40'>
                <div>
                  <CardTitle className='text-sm sm:text-base font-bold text-foreground'>
                    Client & Billing Information
                  </CardTitle>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Select an existing contact or enter client details manually.
                  </p>
                </div>
                {contacts.length > 0 && (
                  <div className='w-48'>
                    <Select
                      value={selectedContactId}
                      onValueChange={handleContactSelect}
                    >
                      <SelectTrigger className='h-8 text-xs bg-background'>
                        <SelectValue placeholder='Select Contact' />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.contactId} value={c.contactId}>
                            {c.name} {c.company ? `(${c.company})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
              <CardContent className='p-5 sm:p-6 space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Client Name *</Label>
                    <Input
                      type='text'
                      required
                      value={clientInfo.name}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, name: e.target.value })
                      }
                      placeholder='e.g. Acme Studio / John Doe'
                      className='h-9 text-xs bg-background'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Company Name</Label>
                    <Input
                      type='text'
                      value={clientInfo.company}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, company: e.target.value })
                      }
                      placeholder='e.g. Acme Studio LLC'
                      className='h-9 text-xs bg-background'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Client Email</Label>
                    <Input
                      type='email'
                      value={clientInfo.email}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, email: e.target.value })
                      }
                      placeholder='client@example.com'
                      className='h-9 text-xs bg-background'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Client Phone</Label>
                    <Input
                      type='text'
                      value={clientInfo.phone}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, phone: e.target.value })
                      }
                      placeholder='+91 98765 43210'
                      className='h-9 text-xs bg-background'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Client Address</Label>
                    <Input
                      type='text'
                      value={clientInfo.address}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, address: e.target.value })
                      }
                      placeholder='City, State, Country'
                      className='h-9 text-xs bg-background'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Client GSTIN (optional)</Label>
                    <Input
                      type='text'
                      value={clientInfo.gstin || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, gstin: e.target.value })
                      }
                      placeholder='24XXXXXXXXXXXX'
                      className='font-mono text-xs h-9 bg-background'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items Editor */}
            <InvoiceLineItemsEditor
              items={items}
              onChange={setItems}
              taxMode={taxMode}
              currencySymbol={currencySymbol}
            />

            {/* Payment Details & Instructions */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 sm:px-6 border-b border-border/40'>
                <CardTitle className='text-sm sm:text-base font-bold text-foreground flex items-center gap-2'>
                  <IconCreditCard className='h-4 w-4 text-primary' />
                  <span>Bank Transfer & UPI Instructions</span>
                </CardTitle>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Provide your bank account, IFSC code, UPI ID, or remittance guidelines.
                </p>
              </CardHeader>
              <CardContent className='p-5 sm:p-6 space-y-4'>
                <div className='space-y-1.5'>
                  <Textarea
                    rows={4}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder='Bank: HDFC Bank&#10;A/C No: 50100012345678&#10;IFSC: HDFC0001234&#10;UPI ID: freelancer@upi'
                    className='font-mono text-xs resize-none bg-background leading-relaxed'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms & Notes */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 sm:px-6 border-b border-border/40'>
                <CardTitle className='text-sm sm:text-base font-bold text-foreground'>
                  Payment Terms & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 sm:p-6 space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Payment Terms</Label>
                  <Textarea
                    rows={2}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder='Payment due within 14 days of invoice issuance...'
                    className='text-xs resize-none bg-background leading-relaxed'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Client Notes</Label>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Thank you for your business! Please include the invoice number in your remarks.'
                    className='text-xs resize-none bg-background leading-relaxed'
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Tax Configuration & Financial Summary Card */}
          <div className='space-y-6'>
            {/* Tax Mode Configuration */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 border-b border-border/40'>
                <CardTitle className='text-sm font-bold text-foreground'>
                  Tax Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 space-y-4 text-xs'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Tax Scheme</Label>
                  <Select
                    value={taxMode}
                    onValueChange={(val) => setTaxMode(val as TaxMode)}
                  >
                    <SelectTrigger className='h-9 text-xs bg-background'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None (Unregistered Freelancer)</SelectItem>
                      <SelectItem value='gst'>Indian GST (CGST/SGST or IGST)</SelectItem>
                      <SelectItem value='flat'>Flat Tax Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {taxMode === 'gst' && (
                  <div className='rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 space-y-1.5 text-blue-900 dark:text-blue-300'>
                    <span className='font-semibold block text-[11px]'>
                      GST Calculation
                    </span>
                    <p className='text-[10px] leading-relaxed'>
                      Intra-state sales split 50/50 between CGST and SGST. Inter-state sales apply IGST.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Freelancer Billing Profile Snapshot */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 border-b border-border/40'>
                <CardTitle className='text-sm font-bold text-foreground'>
                  Freelancer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 space-y-3 text-xs'>
                <div className='space-y-1'>
                  <Label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    Studio Name
                  </Label>
                  <Input
                    type='text'
                    value={freelancerInfo.businessName || freelancerInfo.name}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        businessName: e.target.value,
                      })
                    }
                    className='h-8 text-xs bg-background'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    Freelancer GSTIN
                  </Label>
                  <Input
                    type='text'
                    value={freelancerInfo.gstin || ''}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        gstin: e.target.value,
                      })
                    }
                    placeholder='24XXXXXXXXXXXX'
                    className='h-8 text-xs font-mono bg-background'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    Freelancer State
                  </Label>
                  <Input
                    type='text'
                    value={freelancerInfo.state || ''}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        state: e.target.value,
                      })
                    }
                    placeholder='Maharashtra'
                    className='h-8 text-xs bg-background'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Overall Discount Input */}
            <Card className='border-border/60 shadow-2xs'>
              <CardHeader className='pb-3 pt-5 px-5 border-b border-border/40'>
                <CardTitle className='text-sm font-bold text-foreground'>
                  Invoice-Level Discount
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 space-y-2 text-xs'>
                <Label className='text-xs font-semibold'>
                  Discount Amount ({currencySymbol})
                </Label>
                <Input
                  type='text'
                  inputMode='decimal'
                  value={overallDiscount}
                  onChange={(e) =>
                    setOverallDiscount(parseFloat(e.target.value) || 0)
                  }
                  placeholder='0.00'
                  className='h-9 text-xs font-mono bg-background'
                />
              </CardContent>
            </Card>

            {/* Real-time Calculation Summary Box */}
            <Card className='border-border/60 shadow-2xs bg-muted/20'>
              <CardHeader className='pb-3 pt-5 px-5 border-b border-border/40'>
                <CardTitle className='text-sm font-bold text-foreground'>
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 space-y-2.5 text-xs'>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Subtotal</span>
                  <span className='font-mono font-medium text-foreground'>
                    {formatCurrency(summary.subtotal)}
                  </span>
                </div>

                {summary.discountAmount > 0 && (
                  <div className='flex justify-between items-center text-emerald-600 dark:text-emerald-400'>
                    <span>Discount</span>
                    <span className='font-mono font-medium'>
                      - {formatCurrency(summary.discountAmount)}
                    </span>
                  </div>
                )}

                {taxMode === 'gst' && summary.taxDetails ? (
                  summary.taxDetails.isInterState ? (
                    <div className='flex justify-between items-center text-muted-foreground'>
                      <span>IGST (Inter-state)</span>
                      <span className='font-mono text-foreground'>
                        + {formatCurrency(summary.taxDetails.igstAmount)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className='flex justify-between items-center text-muted-foreground'>
                        <span>CGST (Intra-state)</span>
                        <span className='font-mono text-foreground'>
                          + {formatCurrency(summary.taxDetails.cgstAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-muted-foreground'>
                        <span>SGST (Intra-state)</span>
                        <span className='font-mono text-foreground'>
                          + {formatCurrency(summary.taxDetails.sgstAmount)}
                        </span>
                      </div>
                    </>
                  )
                ) : summary.taxAmount > 0 ? (
                  <div className='flex justify-between items-center text-muted-foreground'>
                    <span>Tax</span>
                    <span className='font-mono text-foreground'>
                      + {formatCurrency(summary.taxAmount)}
                    </span>
                  </div>
                ) : null}

                <div className='pt-3 border-t border-border/60 flex justify-between items-baseline'>
                  <span className='font-bold uppercase tracking-wider text-foreground text-sm'>
                    Total Amount
                  </span>
                  <span className='font-mono font-black text-xl text-foreground'>
                    {formatCurrency(summary.totalAmount)}
                  </span>
                </div>

                <div className='pt-2'>
                  <Button
                    type='button'
                    className='w-full text-xs font-semibold h-10 gap-2 shadow-2xs'
                    disabled={isSaving}
                    onClick={() => handleSave(false)}
                  >
                    {isSaving ? (
                      <IconLoader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <IconDeviceFloppy className='h-4 w-4' />
                    )}
                    <span>Save Draft Invoice</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
