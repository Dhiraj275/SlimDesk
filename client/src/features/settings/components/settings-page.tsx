'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { BusinessProfileTab } from './business-profile-tab';
import { BrandingTab } from './branding-tab';
import { PaymentProfilesTab } from './payment-profiles-tab';
import { FinancialDefaultsTab } from './financial-defaults-tab';
import { ServicesCatalogTab } from './services-catalog-tab';
import { SnippetsTab } from './snippets-tab';
import {
  IconBuilding,
  IconPalette,
  IconCreditCard,
  IconCoins,
  IconBriefcase,
  IconFileText,
} from '@tabler/icons-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className='space-y-6 pb-20'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          Settings & Document Configuration
        </h1>
        <p className='text-sm text-muted-foreground'>
          Manage your business identity, branding, payout accounts, line-item catalog, and document defaults.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <div className='overflow-x-auto pb-1'>
          <TabsList className='h-10 text-xs p-1 inline-flex w-auto'>
            <TabsTrigger value='profile' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconBuilding className='h-3.5 w-3.5' />
              <span>Business Profile</span>
            </TabsTrigger>
            <TabsTrigger value='branding' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconPalette className='h-3.5 w-3.5' />
              <span>Branding & Logo</span>
            </TabsTrigger>
            <TabsTrigger value='payments' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconCreditCard className='h-3.5 w-3.5' />
              <span>Payment Profiles</span>
            </TabsTrigger>
            <TabsTrigger value='financial' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconCoins className='h-3.5 w-3.5' />
              <span>Financial Defaults</span>
            </TabsTrigger>
            <TabsTrigger value='catalog' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconBriefcase className='h-3.5 w-3.5' />
              <span>Services Catalog</span>
            </TabsTrigger>
            <TabsTrigger value='snippets' className='text-xs flex items-center gap-1.5 px-3 h-8'>
              <IconFileText className='h-3.5 w-3.5' />
              <span>Terms & Snippets</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='profile' className='space-y-6 outline-none'>
          <BusinessProfileTab />
        </TabsContent>

        <TabsContent value='branding' className='space-y-6 outline-none'>
          <BrandingTab />
        </TabsContent>

        <TabsContent value='payments' className='space-y-6 outline-none'>
          <PaymentProfilesTab />
        </TabsContent>

        <TabsContent value='financial' className='space-y-6 outline-none'>
          <FinancialDefaultsTab />
        </TabsContent>

        <TabsContent value='catalog' className='space-y-6 outline-none'>
          <ServicesCatalogTab />
        </TabsContent>

        <TabsContent value='snippets' className='space-y-6 outline-none'>
          <SnippetsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
