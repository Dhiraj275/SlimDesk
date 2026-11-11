'use client';

import { loginUser } from '@/features/auth/api/auth.api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../providers/auth-provider';
import { ApiError } from '@/shared/utils/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Card, CardContent } from '@/shared/components/ui/card';
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
  IconAlertCircle,
} from '@tabler/icons-react';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const response = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });
      await login(response);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (e) {
      const apiErr = e as ApiError;
      const msg = apiErr.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex w-full max-w-md flex-col gap-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
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
          Welcome back
        </h1>
        <p className='text-sm text-muted-foreground'>
          Sign in to your account to continue
        </p>
      </div>

      <Card className='border-border/50 shadow-xl backdrop-blur-sm'>
        <CardContent className='pt-6'>
          {error && (
            <div className='mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
              <IconAlertCircle className='h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <IconMail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        type='email'
                        placeholder='name@example.com'
                        className='pl-9'
                        autoComplete='email'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <IconLock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your password'
                        className='pl-9 pr-9'
                        autoComplete='current-password'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin mr-2' />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>
        </CardContent>
      </Card>

      <p className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link
          href='/register'
          className='font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline'
        >
          Create account
        </Link>
      </p>

      <p className='text-center text-xs text-muted-foreground/60'>
        By continuing, you agree to our{' '}
        <Link href='/terms-of-service' className='underline underline-offset-4 hover:text-muted-foreground'>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href='/privacy-policy' className='underline underline-offset-4 hover:text-muted-foreground'>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
