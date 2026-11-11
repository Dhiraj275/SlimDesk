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
  TaxMode,
  PartyInfo,
} from '../../types/invoice.types';
import { useSettings } from '@/features/settings/context/settings-context';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import {
  IconReceipt2,
  IconEye,
  IconEdit,
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconLoader2,
  IconSend,
  IconCreditCard,
  IconFileText,
} from '@tabler/icons-react';

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
    initialData?.title || initialTitle || ''
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
    name: initialData?.freelancerInfo?.name || '',
    businessName: initialData?.freelancerInfo?.businessName || '',
    email: initialData?.freelancerInfo?.email || '',
    phone: initialData?.freelancerInfo?.phone || '',
    address: initialData?.freelancerInfo?.address || '',
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
        description: '',
        quantity: 1,
        unit: 'units',
        unitPrice: '',
        discountAmount: 0,
        taxRate: 0,
        sortOrder: 0,
      },
    ];
  });

  const [paymentDetails, setPaymentDetails] = useState(
    initialData?.paymentDetails || ''
  );
  const [terms, setTerms] = useState(
    initialData?.terms || ''
  );
  const [notes, setNotes] = useState(
    initialData?.notes || ''
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);

  const { settings, getDefaultPaymentProfile } = useSettings();

  // Snapshot defaults from settings when creating a brand new invoice
  useEffect(() => {
    if (!initialData) {
      if (settings.businessProfile?.businessName) {
        setFreelancerInfo((prev) => ({
          ...prev,
          name: settings.businessProfile.businessName,
          businessName: settings.businessProfile.legalName || settings.businessProfile.businessName,
          email: settings.businessProfile.email || prev.email,
          phone: settings.businessProfile.phone || prev.phone,
          address: settings.businessProfile.address || prev.address,
          gstin: settings.businessProfile.gstin || prev.gstin,
          state: settings.businessProfile.state || prev.state,
        }));
      }
      const defProfile = getDefaultPaymentProfile();
      if (defProfile?.details) {
        setPaymentDetails(defProfile.details);
      }
      if (settings.financialDefaults?.defaultCurrency) {
        setCurrency(settings.financialDefaults.defaultCurrency);
      }
      if (settings.financialDefaults?.defaultTaxMode) {
        setTaxMode(settings.financialDefaults.defaultTaxMode);
      }
    }
  }, [initialData]);

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

  // Save invoice
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
    <div className='space-y-6 pb-20'>
      {/* Top Header & Actions Bar */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='-ml-2 h-9 w-9 p-0 text-muted-foreground hover:text-foreground'
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              {isEditing
                ? `Edit ${initialData?.invoiceNumber}`
                : 'Create New Invoice'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Issue commercial invoices, specify payment instructions, and track incoming payments.
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className='flex items-center flex-wrap gap-2.5 self-stretch sm:self-auto'>
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className='w-auto'
          >
            <TabsList className='h-9 text-xs p-1'>
              <TabsTrigger value='editor' className='text-xs flex items-center gap-1.5 px-3 h-7'>
                <IconEdit className='h-3.5 w-3.5' />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value='preview' className='text-xs flex items-center gap-1.5 px-3 h-7'>
                <IconEye className='h-3.5 w-3.5' />
                <span>Live Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className='h-9 text-xs font-semibold gap-1.5 shadow-xs'
          >
            {isSaving ? (
              <IconLoader2 className='h-4 w-4 animate-spin' />
            ) : (
              <IconDeviceFloppy className='h-4 w-4' />
            )}
            <span>Save Draft</span>
          </Button>

          <Button
            type='button'
            size='sm'
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className='h-9 text-xs font-semibold gap-1.5 shadow-xs'
          >
            <IconSend className='h-4 w-4' />
            <span>Finalize & Issue</span>
          </Button>
        </div>
      </div>

      {/* Main Content: Tab View */}
      {activeTab === 'preview' ? (
        <div className='animate-in fade-in-50 duration-200 py-4'>
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
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
          {/* Left Column: Form Details (8 cols) */}
          <div className='lg:col-span-8 space-y-6'>
            {/* Header & Meta Card */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                  <IconReceipt2 className='h-4 w-4 text-primary' />
                  Invoice Subject & Dates
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Invoice Subject / Project Title
                  </Label>
                  <Input
                    type='text'
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. Website Redesign & Frontend Development'
                    className='h-10 text-xs sm:text-sm'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className='h-10 text-xs font-mono'>
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
                    <Label className='text-xs font-medium'>Invoice Date</Label>
                    <Input
                      type='date'
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className='h-10 text-xs'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Payment Due Date</Label>
                    <Input
                      type='date'
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className='h-10 text-xs'
                    />
                    <div className='flex items-center gap-1 flex-wrap pt-0.5'>
                      <span className='text-[10px] text-muted-foreground mr-0.5'>Presets:</span>
                      {[
                        { label: 'Today', days: 0 },
                        { label: '+7d', days: 7 },
                        { label: '+14d', days: 14 },
                        { label: '+30d', days: 30 },
                        { label: '+60d', days: 60 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type='button'
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + preset.days);
                            setDueDate(d.toISOString().split('T')[0]);
                          }}
                          className='px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors'
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Selection & Information Card */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                    <IconUser className='h-4 w-4 text-primary' />
                    Client & Billing Information
                  </CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    Link with an existing contact or enter details directly.
                  </p>
                </div>

                {contacts.length > 0 && (
                  <Select
                    value={selectedContactId}
                    onValueChange={handleContactSelect}
                  >
                    <SelectTrigger className='h-9 text-xs w-52'>
                      <SelectValue placeholder='Choose contact...' />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.contactId} value={c.contactId} className='text-xs'>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Client Contact Name</Label>
                    <Input
                      type='text'
                      required
                      value={clientInfo.name}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, name: e.target.value })
                      }
                      placeholder='e.g. Acme Studio / Rajesh Sharma'
                      className='h-10'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Company Name (Optional)</Label>
                    <Input
                      type='text'
                      value={clientInfo.company || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, company: e.target.value })
                      }
                      placeholder='e.g. Acme Studio Inc.'
                      className='h-10'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Client Email</Label>
                    <Input
                      type='email'
                      value={clientInfo.email || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, email: e.target.value })
                      }
                      placeholder='client@acme.com'
                      className='h-10'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Client Phone</Label>
                    <Input
                      type='text'
                      value={clientInfo.phone || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, phone: e.target.value })
                      }
                      placeholder='+91 98765 43210'
                      className='h-10'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Client Billing Address</Label>
                    <Input
                      type='text'
                      value={clientInfo.address || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, address: e.target.value })
                      }
                      placeholder='Street, City, Pin/Zip Code'
                      className='h-10'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Client GSTIN (Optional)</Label>
                    <Input
                      type='text'
                      value={clientInfo.gstin || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, gstin: e.target.value })
                      }
                      placeholder='24XXXXXXXXXXXX'
                      className='font-mono text-xs h-10'
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
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3 flex flex-row items-center justify-between flex-wrap gap-2'>
                <div className='space-y-1'>
                  <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                    <IconCreditCard className='h-4 w-4 text-primary' />
                    Bank Transfer & UPI Instructions
                  </CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    Provide your bank account, IFSC code, UPI ID, or remittance guidelines.
                  </p>
                </div>

                {settings.paymentProfiles.length > 0 && (
                  <Select
                    onValueChange={(id) => {
                      const found = settings.paymentProfiles.find((p) => p.id === id);
                      if (found) setPaymentDetails(found.details);
                    }}
                  >
                    <SelectTrigger className='h-8 text-xs w-52'>
                      <SelectValue placeholder='Load Payment Profile...' />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.paymentProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id} className='text-xs'>
                          {p.name} {p.isDefault ? '· Default' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Textarea
                    rows={4}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder='Bank: HDFC Bank&#10;A/C No: 50100012345678&#10;IFSC: HDFC0001234&#10;UPI ID: freelancer@upi'
                    className='font-mono text-xs resize-y leading-relaxed'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms & Notes */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <div className='space-y-1'>
                  <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                    <IconFileText className='h-4 w-4 text-primary' />
                    Payment Terms & Notes
                  </CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    Specify payment conditions and any closing note to the client.
                  </p>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between flex-wrap gap-1'>
                    <Label className='text-xs font-medium'>Payment Terms</Label>
                    {settings.snippets.filter((s) => s.category === 'terms').length > 0 && (
                      <div className='flex items-center gap-1 flex-wrap'>
                        <span className='text-[10px] text-muted-foreground mr-0.5'>Snippets:</span>
                        {settings.snippets
                          .filter((s) => s.category === 'terms')
                          .map((s) => (
                            <Badge
                              key={s.id}
                              variant='outline'
                              onClick={() => setTerms(s.content)}
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
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder='Payment due within 14 days of invoice issuance...'
                    className='text-xs resize-y leading-relaxed'
                  />
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between flex-wrap gap-1'>
                    <Label className='text-xs font-medium'>Client Notes / Footer Message</Label>
                    {settings.snippets.filter((s) => s.category === 'notes').length > 0 && (
                      <div className='flex items-center gap-1 flex-wrap'>
                        <span className='text-[10px] text-muted-foreground mr-0.5'>Snippets:</span>
                        {settings.snippets
                          .filter((s) => s.category === 'notes')
                          .map((s) => (
                            <Badge
                              key={s.id}
                              variant='outline'
                              onClick={() => setNotes(s.content)}
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
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Thank you for your business! Please include the invoice number in your remarks.'
                    className='text-xs resize-y leading-relaxed'
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tax, Profile Snapshot & Financial Summary (4 cols) */}
          <div className='lg:col-span-4 space-y-6 sticky top-6'>
            {/* Tax Mode Configuration */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Tax Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-xs'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Tax Scheme</Label>
                  <Select
                    value={taxMode}
                    onValueChange={(val) => setTaxMode(val as TaxMode)}
                  >
                    <SelectTrigger className='h-10 text-xs'>
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
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Freelancer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3.5 text-xs'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Studio / Business Name</Label>
                  <Input
                    type='text'
                    value={freelancerInfo.businessName || freelancerInfo.name}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        businessName: e.target.value,
                      })
                    }
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Freelancer GSTIN</Label>
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
                    className='h-9 text-xs font-mono'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Freelancer State</Label>
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
                    className='h-9 text-xs'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary Card with Discount */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3.5 text-xs'>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Subtotal ({summary.items.length} line items)</span>
                  <span className='font-semibold text-foreground text-sm tabular-nums'>
                    {formatCurrency(summary.subtotal)}
                  </span>
                </div>

                <div className='space-y-1.5 pt-1'>
                  <Label className='text-xs font-medium'>
                    Overall Discount ({currencySymbol})
                  </Label>
                  <Input
                    type='number'
                    min='0'
                    value={overallDiscount}
                    onChange={(e) =>
                      setOverallDiscount(parseFloat(e.target.value) || 0)
                    }
                    placeholder='0.00'
                    className='h-10 text-xs text-right tabular-nums'
                  />
                </div>

                {/* Tax Breakdown */}
                {taxMode === 'gst' && summary.taxDetails ? (
                  summary.taxDetails.isInterState ? (
                    <div className='pt-2 border-t border-dashed border-border/50 space-y-1.5'>
                      <div className='flex justify-between items-center text-muted-foreground'>
                        <span>IGST (Inter-state)</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                          + {formatCurrency(summary.taxDetails.igstAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='pt-2 border-t border-dashed border-border/50 space-y-1.5'>
                      <div className='flex justify-between items-center text-muted-foreground'>
                        <span>CGST (Intra-state)</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                          + {formatCurrency(summary.taxDetails.cgstAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-muted-foreground'>
                        <span>SGST (Intra-state)</span>
                        <span className='font-semibold text-foreground tabular-nums'>
                          + {formatCurrency(summary.taxDetails.sgstAmount)}
                        </span>
                      </div>
                    </div>
                  )
                ) : summary.taxAmount > 0 ? (
                  <div className='pt-2 border-t border-dashed border-border/50 space-y-1.5'>
                    <div className='flex justify-between items-center text-muted-foreground'>
                      <span>Tax Amount</span>
                      <span className='font-semibold text-foreground tabular-nums'>
                        + {formatCurrency(summary.taxAmount)}
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Total */}
                <div className='pt-3 border-t border-border/60 flex justify-between items-baseline'>
                  <span className='text-sm font-bold text-foreground'>
                    Grand Total
                  </span>
                  <span className='text-xl font-bold text-foreground tracking-tight tabular-nums'>
                    {formatCurrency(summary.totalAmount)}
                  </span>
                </div>

                <div className='pt-2'>
                  <Button
                    type='button'
                    className='w-full text-xs font-semibold h-10 gap-2 shadow-xs'
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
