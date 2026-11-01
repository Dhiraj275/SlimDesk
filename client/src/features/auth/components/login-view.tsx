'use client';

import { AuthIllustration } from './auth-illustration';
import LoginForm from './login-form';

export default function LoginViewPage() {
  return (
    <div className='relative grid min-h-screen lg:grid-cols-2'>
      {/* Left panel - Illustration */}
      <AuthIllustration
        title='Your leads, deals & invoices — all in one place.'
        subtitle='A lightweight CRM built for freelancers, agencies, and small businesses who want simplicity over bloat.'
      />

      {/* Right panel - Form */}
      <div className='flex items-center justify-center p-6 sm:p-8 lg:p-12'>
        <LoginForm />
      </div>
    </div>
  );
}
