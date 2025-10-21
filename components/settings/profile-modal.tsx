'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateProfileSchema } from '@/lib/validators/auth';
import type { SafeUser } from '@/types';
import { useAuth } from '@/components/providers/auth-context';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';

const formSchema = updateProfileSchema;
type FormValues = z.infer<typeof formSchema>;

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Bogota',
  'America/Lima',
  'America/Mexico_City',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Madrid'
];

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: SafeUser;
};

export function ProfileModal({ open, onClose, user }: ProfileModalProps) {
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      timezone: user.timezone ?? 'America/Sao_Paulo'
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user.name,
        phone: user.phone ?? '',
        avatarUrl: user.avatarUrl ?? '',
        timezone: user.timezone ?? 'America/Sao_Paulo'
      });
    }
  }, [open, reset, user]);

  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Perfil atualizado com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.body?.error ?? 'Não foi possível atualizar o perfil.'
      );
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      name: values.name,
      phone: values.phone || null,
      avatarUrl: values.avatarUrl || null,
      timezone: values.timezone
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" {...register('name')} />
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register('phone')} placeholder="+55 11 99999-0000" />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="avatarUrl">URL do avatar</Label>
          <Input id="avatarUrl" {...register('avatarUrl')} placeholder="https://..." />
          {errors.avatarUrl ? (
            <p className="mt-1 text-sm text-red-600">{errors.avatarUrl.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="timezone">Fuso horário</Label>
          <Select id="timezone" {...register('timezone')}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
          {errors.timezone ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.timezone.message}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
