'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TaxConfigurationCard } from './tax-configuration-card';
import { LineItemsEditor } from './line-items-editor';
import { TermsAndPaymentCard } from './terms-and-payment-card';
import { QuotationDocument } from '../quotation-preview/quotation-document';
import { PdfActionsMenu } from '../../pdf/pdf-actions-menu';
import { calculateQuotationSummary, FormItemInput } from '../../utils/quotation-calc';
import { quotationsApi } from '../../api/quotations.api';
import { contactsApi } from '@/features/contacts/api/contacts.api';
import { Contact } from '@/features/contacts/types/contact.types';
import {
  Quotation,
  CreateQuotationPayload,
  TaxMode,
  PartyInfo,
} from '../../types/quotation.types';
import { toast } from 'sonner';
import {
  IconFileText,
  IconEye,
  IconEdit,
  IconSend,
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconBuilding,
  IconLoader2,
} from '@tabler/icons-react';

interface QuotationFormProps {
  initialData?: Quotation;
  initialLeadId?: string;
  initialContactId?: string;
  initialClientInfo?: Partial<PartyInfo>;
  initialTitle?: string;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialData,
  initialLeadId,
  initialContactId,
  initialClientInfo,
  initialTitle,
}) => {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form states
  const [title, setTitle] = useState(
    initialData?.title || initialTitle || 'Website Redesign & Development'
  );
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    initialData?.expiryDate ||
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

  // Contacts for quick select
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialData?.contactId || initialContactId || ''
  );

  // Parties info
  const [freelancerInfo, setFreelancerInfo] = useState<PartyInfo>({
    name: initialData?.freelancerInfo?.name || 'Studio Freelance',
    businessName: initialData?.freelancerInfo?.businessName || '',
    email: initialData?.freelancerInfo?.email || '',
    phone: initialData?.freelancerInfo?.phone || '',
    address: initialData?.freelancerInfo?.address || '',
    gstin: initialData?.freelancerInfo?.gstin || '',
    state: initialData?.freelancerInfo?.state || 'Maharashtra',
  });

  const [clientInfo, setClientInfo] = useState<PartyInfo>({
    name:
      initialData?.clientInfo?.name ||
      initialClientInfo?.name ||
      'Acme Studio',
    company:
      initialData?.clientInfo?.company ||
      initialClientInfo?.company ||
      'Acme Studio Inc.',
    email:
      initialData?.clientInfo?.email ||
      initialClientInfo?.email ||
      'client@acmestudio.com',
    phone:
      initialData?.clientInfo?.phone ||
      initialClientInfo?.phone ||
      '+91 98765 43210',
    address:
      initialData?.clientInfo?.address ||
      initialClientInfo?.address ||
      'Bandra West, Mumbai 400050',
    gstin: initialData?.clientInfo?.gstin || '',
    state: initialData?.clientInfo?.state || 'Maharashtra',
  });

  const [placeOfSupply, setPlaceOfSupply] = useState(
    initialData?.taxDetails?.placeOfSupply ||
      initialData?.clientInfo?.state ||
      'Maharashtra'
  );

  // Line items
  const [items, setItems] = useState<FormItemInput[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit || 'units',
          unitPrice: i.unitPrice,
          discount: i.discount || 0,
          taxRate: i.taxRate || 0,
          sortOrder: i.sortOrder || 0,
        }))
      : [
          {
            description: 'UI/UX Design & High-Fidelity Prototype',
            quantity: 1,
            unit: 'milestone',
            unitPrice: 35000,
            discount: 0,
            taxRate: 0,
            sortOrder: 0,
          },
          {
            description: 'Next.js Frontend & API Integration',
            quantity: 1,
            unit: 'milestone',
            unitPrice: 45000,
            discount: 0,
            taxRate: 0,
            sortOrder: 1,
          },
        ]
  );

  // Terms & Payment schedule
  const [paymentSchedule, setPaymentSchedule] = useState(
    initialData?.paymentSchedule ||
      '50% advance upon project confirmation, remaining 50% on final handover.'
  );
  const [terms, setTerms] = useState(
    initialData?.terms ||
      '1. Quotation is valid for 14 days from date of issue.\n2. Scope adjustments or additional deliverables will be quoted separately.\n3. Source code & assets handed over upon receipt of final settlement.'
  );
  const [notes, setNotes] = useState(
    initialData?.notes ||
      'Thank you for considering our proposal! Please let us know if you have any questions.'
  );

  // UI state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing contacts for dropdown
  useEffect(() => {
    contactsApi
      .getContacts()
      .then((data) => {
        setContacts(data || []);
      })
      .catch(() => {});
  }, []);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const chosen = contacts.find((c) => c.contactId === contactId);
    if (chosen) {
      setClientInfo((prev) => ({
        ...prev,
        name: chosen.name,
        email: chosen.email || prev.email,
        phone: chosen.phone || prev.phone,
        company: chosen.company || prev.company,
      }));
    }
  };

  // Real-time calculations
  const calculation = useMemo(() => {
    return calculateQuotationSummary(items, taxMode, overallDiscount);
  }, [items, taxMode, overallDiscount]);

  // Handle Save
  const handleSave = async (andSend = false) => {
    if (!title.trim()) {
      toast.error('Please enter a quotation title');
      return;
    }
    if (!clientInfo.name.trim()) {
      toast.error('Please enter client name');
      return;
    }
    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      toast.error('Please add at least one line item with description');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateQuotationPayload = {
        title,
        currency,
        issueDate,
        expiryDate,
        contactId: selectedContactId || undefined,
        leadId: initialData?.leadId || initialLeadId || undefined,
        taxMode,
        discountAmount: Number(overallDiscount) || 0,
        freelancerInfo,
        clientInfo,
        paymentSchedule,
        terms,
        notes,
        items: items.map((i, idx) => ({
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unit: i.unit || 'units',
          unitPrice: Number(i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
          taxRate: taxMode === 'none' ? 0 : Number(i.taxRate) || 0,
          sortOrder: idx,
        })),
      };

      let saved: Quotation;
      if (isEditing && initialData?.quotationId) {
        saved = await quotationsApi.updateQuotation(
          initialData.quotationId,
          payload
        );
        toast.success('Quotation updated successfully');
      } else {
        saved = await quotationsApi.createQuotation(payload);
        toast.success(`Quotation ${saved.quotationNumber} created`);
      }

      if (andSend) {
        await quotationsApi.sendQuotation(saved.quotationId, {});
        toast.success('Quotation marked as Sent with public link generated');
      }

      router.push(`/dashboard/quotations/${saved.quotationId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewQuotation = {
    quotationNumber: initialData?.quotationNumber || 'QT-PREVIEW',
    title,
    currency,
    issueDate,
    expiryDate,
    version: initialData?.version || 1,
    status: initialData?.status || 'draft',
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    taxAmount: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    taxMode,
    freelancerInfo,
    clientInfo,
    paymentSchedule,
    terms,
    notes,
    items: calculation.items,
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
                ? `Edit ${initialData?.quotationNumber}`
                : 'Create New Quotation'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Prepare a commercial proposal, calculate taxes, and share with your client.
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
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className='h-9 text-xs gap-1.5'
          >
            <IconDeviceFloppy className='h-4 w-4' />
            <span>Save Draft</span>
          </Button>

          <Button
            type='button'
            size='sm'
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className='h-9 text-xs font-semibold gap-1.5 shadow-xs'
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className='h-4 w-4 animate-spin' />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconSend className='h-4 w-4' />
                <span>Save & Send</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content: Editor Tab vs Live Preview Tab */}
      {activeTab === 'preview' ? (
        <div className='animate-in fade-in-50 duration-200 space-y-4'>
          <div className='flex justify-end'>
            <PdfActionsMenu quotation={previewQuotation as any} />
          </div>
          <QuotationDocument quotation={previewQuotation as any} />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
          {/* Left Column: Form Details (8 cols) */}
          <div className='lg:col-span-8 space-y-6'>
            {/* Header & Meta Card */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                  <IconFileText className='h-4 w-4 text-primary' />
                  Quotation Subject & Dates
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Quotation Subject / Project Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. Website Development & Maintenance'
                    className='h-10'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className='h-10 text-xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='INR'>INR (₹)</SelectItem>
                        <SelectItem value='USD'>USD ($)</SelectItem>
                        <SelectItem value='EUR'>EUR (€)</SelectItem>
                        <SelectItem value='GBP'>GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Issue Date</Label>
                    <Input
                      type='date'
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className='h-10 text-xs'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Valid Until (Expiry)</Label>
                    <Input
                      type='date'
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className='h-10 text-xs'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client & Contact Selection Card */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
                    <IconUser className='h-4 w-4 text-primary' />
                    Client & Contact Information
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
                      value={clientInfo.name}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, name: e.target.value })
                      }
                      placeholder='e.g. Acme Studio / Rajesh Sharma'
                      className='h-10'
                      required
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium'>Company Name (Optional)</Label>
                    <Input
                      value={clientInfo.company || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, company: e.target.value })
                      }
                      placeholder='Acme Studio Inc.'
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
                      value={clientInfo.phone || ''}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, phone: e.target.value })
                      }
                      placeholder='+91 98765 43210'
                      className='h-10'
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Client Billing Address</Label>
                  <Input
                    value={clientInfo.address || ''}
                    onChange={(e) =>
                      setClientInfo({ ...clientInfo, address: e.target.value })
                    }
                    placeholder='Street, City, Pin/Zip Code'
                    className='h-10'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Optional Tax Configuration Card */}
            <TaxConfigurationCard
              taxMode={taxMode}
              onTaxModeChange={setTaxMode}
              freelancerGstin={freelancerInfo.gstin}
              onFreelancerGstinChange={(val) =>
                setFreelancerInfo({ ...freelancerInfo, gstin: val })
              }
              clientGstin={clientInfo.gstin}
              onClientGstinChange={(val) =>
                setClientInfo({ ...clientInfo, gstin: val })
              }
              placeOfSupply={placeOfSupply}
              onPlaceOfSupplyChange={setPlaceOfSupply}
            />

            {/* Line Items Editor */}
            <LineItemsEditor
              items={items}
              onChange={setItems}
              taxMode={taxMode}
              currencySymbol={currency === 'USD' ? '$' : '₹'}
            />

            {/* Terms and Payment Schedule */}
            <TermsAndPaymentCard
              paymentSchedule={paymentSchedule}
              onPaymentScheduleChange={setPaymentSchedule}
              terms={terms}
              onTermsChange={setTerms}
              notes={notes}
              onNotesChange={setNotes}
            />
          </div>

          {/* Right Column: Live Summary Widget (4 cols) */}
          <div className='lg:col-span-4 space-y-6 sticky top-6'>
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3.5 text-xs'>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Subtotal ({calculation.items.length} line items)</span>
                  <span className='font-semibold text-foreground text-sm tabular-nums'>
                    {currency === 'USD' ? '$' : '₹'}
                    {calculation.subtotal.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className='space-y-1.5 pt-1'>
                  <Label className='text-xs font-medium'>
                    Overall Discount ({currency === 'USD' ? '$' : '₹'})
                  </Label>
                  <Input
                    type='number'
                    min='0'
                    value={overallDiscount}
                    onChange={(e) =>
                      setOverallDiscount(parseFloat(e.target.value) || 0)
                    }
                    className='h-10 text-xs text-right tabular-nums'
                  />
                </div>

                {/* Tax Breakdown (Only shown when taxMode !== 'none') */}
                {taxMode !== 'none' && (
                  <div className='pt-2 border-t border-dashed border-border/50 space-y-1.5'>
                    <div className='flex justify-between items-center text-muted-foreground'>
                      <span>
                        {taxMode === 'gst' ? 'GST Amount' : 'Tax Amount'}
                      </span>
                      <span className='font-semibold text-foreground tabular-nums'>
                        {currency === 'USD' ? '$' : '₹'}
                        {calculation.taxAmount.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className='pt-3 border-t border-border/60 flex justify-between items-baseline'>
                  <span className='text-sm font-bold text-foreground'>
                    Grand Total
                  </span>
                  <span className='text-xl font-bold text-foreground tracking-tight tabular-nums'>
                    {currency === 'USD' ? '$' : '₹'}
                    {calculation.totalAmount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {taxMode === 'none' && (
                  <p className='text-[11px] text-muted-foreground text-right italic'>
                    No Tax applied (0%)
                  </p>
                )}

                <div className='pt-3 space-y-2'>
                  <Button
                    type='button'
                    onClick={() => setActiveTab('preview')}
                    variant='outline'
                    className='w-full h-9 text-xs gap-1.5'
                  >
                    <IconEye className='h-4 w-4' />
                    <span>View Live Preview</span>
                  </Button>

                  <Button
                    type='button'
                    onClick={() => handleSave(false)}
                    disabled={isSubmitting}
                    className='w-full h-9 text-xs font-semibold gap-1.5 shadow-xs'
                  >
                    <IconDeviceFloppy className='h-4 w-4' />
                    <span>Save Quotation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Freelancer Profile Details Card */}
            <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5'>
                  <IconBuilding className='h-4 w-4' />
                  <span>Sender Profile ("From")</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-xs'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Your Name / Brand</Label>
                  <Input
                    value={freelancerInfo.name}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        name: e.target.value,
                      })
                    }
                    className='h-10 text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Studio / Company (Optional)</Label>
                  <Input
                    value={freelancerInfo.businessName || ''}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        businessName: e.target.value,
                      })
                    }
                    className='h-10 text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Your Email</Label>
                  <Input
                    type='email'
                    value={freelancerInfo.email || ''}
                    onChange={(e) =>
                      setFreelancerInfo({
                        ...freelancerInfo,
                        email: e.target.value,
                      })
                    }
                    className='h-10 text-xs'
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
