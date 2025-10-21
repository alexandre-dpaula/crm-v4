'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { requestResetSchema } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';

const formSchema = requestResetSchema;
type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [devToken, setDevToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await authApi.requestReset(values.email);
      toast.success('Se o email estiver cadastrado, enviamos o link de reset.');
      setDevToken(response.resetToken ?? null);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível solicitar o reset de senha.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Recuperar acesso
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Lembrou sua senha?{' '}
          <Link href="/login" className="font-medium text-brand">
            Voltar ao login
          </Link>
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full">
          Enviar instruções
        </Button>
      </form>
      {devToken ? (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-medium">
            Ambiente de desenvolvimento: token de reset
          </p>
          <p className="mt-2 break-all">
            <span className="font-semibold">Token:</span> {devToken}
          </p>
          <p className="mt-1">
            Link direto:{' '}
            <Link
              href={`/reset-password?token=${encodeURIComponent(devToken)}`}
              className="text-brand"
            >
              Abrir formulário
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
