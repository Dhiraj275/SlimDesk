import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About'
};

export default function AboutPage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl'>
            About
          </h1>
          <p className='text-muted-foreground mt-4 text-lg'>
            Learn more about this project
          </p>
        </div>

        {/* Content Sections */}
        <div className='space-y-8'>
          {/* Open Source Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              Open-Source Project
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              SlimDesk is an open-source, lightweight CRM built for
              freelancers, agencies, and small businesses. It provides a clean,
              focused foundation for managing client pipelines, quotations,
              invoices, and analytics. The source code is freely available to
              use, modify, and self-host.
            </p>
          </section>

          {/* Demo Purpose Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              Demo Purpose
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              This instance provides an interactive demonstration of SlimDesk.
              Feel free to explore the interface, test the pipelines, and
              evaluate if it fits your workflow.
            </p>
          </section>

          {/* Data Privacy Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              Data Privacy
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              We take your privacy seriously. No personal data is misused,
              shared, or sold to third parties. Any information collected during
              your use of this demo application is used solely for the purpose
              of providing the demonstration experience.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className='mt-12 text-center'>
          <p className='text-muted-foreground text-sm'>
            SlimDesk — Lightweight Open-Source CRM
          </p>
        </div>
      </div>
    </div>
  );
}
