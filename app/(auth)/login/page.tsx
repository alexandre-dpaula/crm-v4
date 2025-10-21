'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { loginSchema } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

const formSchema = loginSchema;
type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      toast.success('Bem-vindo de volta!');
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error: any) => {
      const message =
        error?.body?.details?.email ||
        error?.body?.error ||
        'Credenciais inválidas.';
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
          Acesse sua conta
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Ainda não tem conta?{' '}
          <Link href="/register" className="font-medium text-brand">
            Cadastre-se
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
            placeholder="voce@empresa.com"
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
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <Checkbox {...register('remember')} />
            Lembrar-me
          </label>
          <Link href="/forgot-password" className="text-brand">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        Ao acessar, você concorda com os Termos de Uso e Política de Privacidade
        da PipelineSaaS.
      </p>
    </div>
  );
}
