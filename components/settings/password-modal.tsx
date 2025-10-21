'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { changePasswordSchema } from '@/lib/validators/auth';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';

const formSchema = changePasswordSchema;
type FormValues = z.infer<typeof formSchema>;

type PasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PasswordModal({ open, onClose }: PasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.body?.error ?? 'Não foi possível alterar a senha.'
      );
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal open={open} onClose={onClose} title="Alterar senha">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="currentPassword">Senha atual</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
          />
          {errors.currentPassword ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
          />
          {errors.newPassword ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
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
            Atualizar senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
