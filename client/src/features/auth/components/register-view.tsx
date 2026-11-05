'use client';

import { AuthIllustration } from './auth-illustration';
import RegisterForm from './register-form';

export default function RegisterViewPage() {
  return (
    <div className='relative grid min-h-screen lg:grid-cols-2'>
      {/* Left panel - Text side with reddish accent glow */}
      <AuthIllustration
        title='Close more deals, stress less.'
        subtitle='Track leads through your pipeline, send quotations, generate invoices, and never miss a follow-up — all from one simple dashboard.'
      />

      {/* Right panel - Form side (clean, no glow) */}
      <div className='flex items-center justify-center p-6 sm:p-8 lg:p-12'>
        <RegisterForm />
      </div>
    </div>
  );
}
