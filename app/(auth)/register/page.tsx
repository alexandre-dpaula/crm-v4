'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { registerSchema } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

const formSchema = registerSchema;
type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptTerms: true
    }
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Conta criada com sucesso! Bem-vindo.');
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error: any) => {
      const message =
        error?.body?.details?.email ||
        error?.body?.error ||
        'Não foi possível criar conta.';
      toast.error(message);
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Crie sua conta SaaS
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Já possui login?{' '}
          <Link href="/login" className="font-medium text-brand">
            Acesse
          </Link>
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Ana Souza"
            autoComplete="name"
            {...register('name')}
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">Email corporativo</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ana@empresa.com"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <Checkbox {...register('acceptTerms')} />
          <span>
            Eu aceito os{' '}
            <Link href="#" className="text-brand">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="#" className="text-brand">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
        ) : null}
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Criar minha conta
        </Button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        Você receberá um pipeline padrão para começar e poderá personalizar
        etapas a qualquer momento.
      </p>
    </div>
  );
}
