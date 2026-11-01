'use client';

import { useState } from 'react';
import { useAuth } from '../providers/auth-provider';
import { registerUser } from '../api/auth.api';
import { ApiError } from '@/shared/utils/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMail,
  IconLock,
  IconUser,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);

  const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        displayName: fullName,
        email,
        password,
      });
      await login(response);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (e) {
      const apiErr = e as ApiError;
      const msg = apiErr.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = PASSWORD_REQUIREMENTS.filter((req) =>
    req.test(password)
  ).length;

  const strengthColors = [
    'bg-destructive',
    'bg-destructive',
    'bg-yellow-500',
    'bg-yellow-500',
    'bg-green-500',
  ];

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className='flex w-full max-w-md flex-col gap-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        {/* Mobile only logo */}
        <div className='mb-6 flex items-center justify-center gap-3 lg:hidden'>
          <Image
            src='/assets/logo.png'
            alt='SlimDesk'
            width={75}
            height={24}
            className='h-8 w-auto object-contain'
            priority
            suppressHydrationWarning
          />
        </div>

        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          Create an account
        </h1>
        <p className='text-sm text-muted-foreground'>
          Start managing your leads, clients, and deals today
        </p>
      </div>

      <Card className='border-border/50 shadow-xl backdrop-blur-sm'>
        <CardContent className='pt-6'>
          {/* Error */}
          {error && (
            <div className='mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
              <IconAlertCircle className='h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className='space-y-4'>
            {/* Full Name */}
            <div className='space-y-2'>
              <Label htmlFor='register-name'>Full Name</Label>
              <div className='relative'>
                <IconUser className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='register-name'
                  type='text'
                  placeholder='John Doe'
                  className='pl-9'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <Label htmlFor='register-email'>Email</Label>
              <div className='relative'>
                <IconMail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='register-email'
                  type='email'
                  placeholder='name@example.com'
                  className='pl-9'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='register-password'>Password</Label>
              <div className='relative'>
                <IconLock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='register-password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Create a password'
                  className='pl-9 pr-9'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedPassword(true)}
                  onBlur={() => setFocusedPassword(false)}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <IconEyeOff className='h-4 w-4' />
                  ) : (
                    <IconEye className='h-4 w-4' />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='flex flex-1 gap-1'>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            i < passwordStrength
                              ? strengthColors[passwordStrength]
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        passwordStrength <= 1
                          ? 'text-destructive'
                          : passwordStrength <= 3
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                      )}
                    >
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>

                  {/* Requirements checklist */}
                  {(focusedPassword || passwordStrength < 4) && (
                    <div className='grid grid-cols-2 gap-1'>
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const met = req.test(password);
                        return (
                          <div
                            key={req.label}
                            className={cn(
                              'flex items-center gap-1.5 text-xs transition-colors',
                              met
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-muted-foreground'
                            )}
                          >
                            <IconCheck
                              className={cn(
                                'h-3 w-3 shrink-0 transition-all',
                                met ? 'opacity-100' : 'opacity-30'
                              )}
                            />
                            <span>{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='register-confirm-password'>
                Confirm Password
              </Label>
              <div className='relative'>
                <IconLock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id='register-confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                  className={cn(
                    'pl-9 pr-9',
                    confirmPassword.length > 0 &&
                      password !== confirmPassword &&
                      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                  )}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showConfirmPassword ? (
                    <IconEyeOff className='h-4 w-4' />
                  ) : (
                    <IconEye className='h-4 w-4' />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className='text-xs text-destructive'>
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline'
        >
          Sign in
        </Link>
      </p>

      <p className='text-center text-xs text-muted-foreground/60'>
        By creating an account, you agree to our{' '}
        <Link
          href='/terms-of-service'
          className='underline underline-offset-4 hover:text-muted-foreground'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='/privacy-policy'
          className='underline underline-offset-4 hover:text-muted-foreground'
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
