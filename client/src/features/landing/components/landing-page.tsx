'use client';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import {
  IconLayoutKanban,
  IconFileInvoice,
  IconUsers,
  IconChartBar,
  IconMail,
  IconCalendarEvent,
  IconBrandGithub,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Aurora from '@/shared/components/backgrounds/aurora-background';
import NoiseOverlay from '@/shared/components/backgrounds/noise-overlay';

/* ─────────────────────────── Navbar ─────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2.5'>
          <Image
            src='/assets/logo.png'
            alt='SlimDesk'
            width={75}
            height={24}
            className='h-7 w-auto object-contain'
            priority
            suppressHydrationWarning
          />
        </Link>

        {/* Desktop links */}

        {/* CTA */}
        <div className='hidden items-center gap-3 md:flex'>
          <Button variant='ghost' size='sm' asChild>
            <a href='https://github.com/Dhiraj275/SlimDesk' target='_blank' rel='noopener noreferrer'>
              GitHub
            </a>
          </Button>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/login'>Sign in</Link>
          </Button>
          <Button size='sm' asChild>
            <Link href='/register'>Get Started</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className='md:hidden text-foreground'
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <IconX className='h-5 w-5' /> : <IconMenu2 className='h-5 w-5' />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 pb-6 pt-4 md:hidden'>
          <div className='flex flex-col gap-4'>
            <a href='#features' onClick={() => setMobileOpen(false)} className='text-sm text-muted-foreground'>Features</a>
            <a href='https://github.com/Dhiraj275/SlimDesk' target='_blank' rel='noopener noreferrer' className='text-sm text-muted-foreground flex items-center gap-2'>
              <IconBrandGithub className='h-4 w-4' /> GitHub
            </a>
            <div className='flex gap-3 pt-2'>
              <Button variant='outline' size='sm' asChild className='flex-1'>
                <Link href='/login'>Sign in</Link>
              </Button>
              <Button size='sm' asChild className='flex-1'>
                <Link href='/register'>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero() {
  return (
    <section className='relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 min-h-[580px] flex items-center justify-center'>
      {/* Background base gradient matching the reference */}
      <div className='absolute inset-0 -z-20 bg-gradient-to-r from-[#050303] via-[#780f20]/40 to-[#050303]' />

      {/* Aurora WebGL canvas & Noise texture overlay */}
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <Aurora />
        <NoiseOverlay opacity={0.02} />
        {/* Smooth bottom vignette gradient fading into page background */}
        <div className='absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none' />
      </div>

      <div className='relative mx-auto max-w-4xl px-6 text-center z-10'>
        {/* Badge */}


        <h1 className='font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
          The CRM that doesn&apos;t get in your way
        </h1>

        <p className='mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl'>
          A lightweight, open-source CRM built for freelancers, agencies, and
          small businesses. Leads, deals, quotations, invoices — all in one
          clean dashboard.
        </p>

        <div className='mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <Button size='lg' asChild className='w-full sm:w-auto bg-white text-black'>
            <Link href='/register'>
              Try the demo
            </Link>
          </Button>
          <Button variant='outline' size='lg' asChild className='w-full sm:w-auto'>
            <a href='https://github.com/Dhiraj275/SlimDesk' target='_blank' rel='noopener noreferrer'>
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Features ─────────────────────────── */

const FEATURES = [
  {
    icon: IconLayoutKanban,
    title: 'Deals Pipeline',
    description:
      'Drag-and-drop Kanban board to track deals from first contact to close.',
  },
  {
    icon: IconUsers,
    title: 'Leads & Clients',
    description:
      'Capture leads, convert them to clients, and keep all contacts organized.',
  },
  {
    icon: IconFileInvoice,
    title: 'Quotations & Invoices',
    description:
      'Generate professional quotations, convert to invoices, and track payments.',
  },
  {
    icon: IconChartBar,
    title: 'Dashboard Analytics',
    description:
      'Revenue, active clients, pending invoices — all your metrics at a glance.',
  },
  {
    icon: IconCalendarEvent,
    title: 'Follow-ups & Tasks',
    description:
      'Never miss a follow-up. Schedule reminders and track activities per client.',
  },
  {
    icon: IconMail,
    title: 'Email Templates',
    description:
      'Save and reuse templates for proposals, invoices, payment reminders, and more.',
  },
];

function Features() {
  return (
    <section id='features' className='scroll-mt-20 py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-6'>
        <div className='mx-auto max-w-2xl text-center'>
          <p className='text-sm font-semibold uppercase tracking-widest text-muted-foreground'>
            Features
          </p>
          <h2 className='mt-3 text-3xl font-bold tracking-tight sm:text-4xl'>
            Everything you need, nothing you don&apos;t
          </h2>
          <p className='mt-4 text-muted-foreground'>
            Built specifically for freelancers, agencies, and small businesses
            who are tired of overcomplicated CRMs.
          </p>
        </div>

        <div className='mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className='group relative rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border hover:shadow-lg'
            >
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-foreground group-hover:text-background'>
                <f.icon className='h-5 w-5' />
              </div>
              <h3 className='text-base font-semibold'>{f.title}</h3>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────────── CTA ─────────────────────────── */

function CTA() {
  return (
    <section className='py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-6'>
        <div className='relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl px-6 py-16 text-center sm:px-16'>
          {/* Subtle glow */}
          <div className='pointer-events-none absolute inset-0'>
            <div className='absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.03] blur-3xl' />
          </div>

          <div className='relative'>
            <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
              Like what you see?
            </h2>
            <p className='mx-auto mt-4 max-w-xl text-muted-foreground'>
              SlimDesk is open source and free to self-host.
              Star the repo, fork it, or spin up your own instance.
            </p>
            <div className='mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
              <Button size='lg' asChild>
                <a href='https://github.com/Dhiraj275/SlimDesk' target='_blank' rel='noopener noreferrer'>
                  Star on GitHub
                </a>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='/register'>
                  Try the demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */

function Footer() {
  return (
    <footer className='border-t border-border/30 py-12'>
      <div className='mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between'>
        <div className='flex items-center gap-2'>
          <Image
            src='/assets/logo.png'
            alt='SlimDesk'
            width={75}
            height={24}
            className='h-6 w-auto object-contain'
            suppressHydrationWarning
          />
        </div>

        <div className='flex items-center gap-6 text-sm text-muted-foreground'>
          <a href='https://github.com/Dhiraj275/SlimDesk' target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors flex items-center gap-1.5'>
            <IconBrandGithub className='h-4 w-4' />
            GitHub
          </a>
          <Link href='/privacy-policy' className='hover:text-foreground transition-colors'>
            Privacy
          </Link>
          <Link href='/terms-of-service' className='hover:text-foreground transition-colors'>
            Terms
          </Link>
        </div>

        <p className='text-xs text-muted-foreground/60'>
          Built by{' '}
          <a href='https://github.com/Dhiraj275' target='_blank' rel='noopener noreferrer' className='underline underline-offset-4 hover:text-muted-foreground'>
            Dhiraj
          </a>
          {' '}· MIT License
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Landing Page ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
