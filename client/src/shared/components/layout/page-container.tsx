import React from 'react';
import { Heading } from '../ui/heading';

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-8 w-48 rounded' />
          <div className='bg-muted h-4 w-96 rounded' />
        </div>
      </div>
      <div className='bg-muted mt-6 h-40 w-full rounded-lg' />
      <div className='bg-muted h-40 w-full rounded-lg' />
    </div>
  );
}

export default function PageContainer({
  children,
  scrollable = true,
  isloading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  button,
  pageHeaderAction
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  isloading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: React.ReactNode;
  button?: React.ReactNode;
}) {
  if (!access) {
    return (
      <div className='flex flex-1 items-center justify-center p-4 md:px-6'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center text-lg'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isloading ? <PageSkeleton /> : children;

  return (
    <div
      className={`flex flex-1 flex-col h-full min-h-0 w-full min-w-0 max-w-full ${
        scrollable ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
    >
      <div className='flex flex-1 flex-col p-4 md:px-6 min-w-0 max-w-full pb-8'>
        <div className='mb-4 flex items-start justify-between'>
          <Heading
            title={pageTitle ?? ''}
            description={pageDescription ?? ''}
            button={button}
          />
          {pageHeaderAction && <div>{pageHeaderAction}</div>}
        </div>
        {content}
      </div>
    </div>
  );
}

