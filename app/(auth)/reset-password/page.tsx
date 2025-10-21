'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';

const formSchema = resetPasswordSchema;
type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.resetPassword(values);
      toast.success('Senha redefinida! Você já está autenticado.');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      const message =
        error?.body?.details?.token ||
        error?.body?.error ||
        'Não foi possível redefinir a senha.';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Definir nova senha
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Já possui uma senha?{' '}
          <Link href="/login" className="font-medium text-brand">
            Acesse sua conta
          </Link>
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="token">Token de verificação</Label>
          <Input id="token" {...register('token')} />
          {errors.token ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.token.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full">
          Atualizar senha
        </Button>
      </form>
    </div>
  );
}
