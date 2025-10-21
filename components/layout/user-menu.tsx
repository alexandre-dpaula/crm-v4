'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Pencil, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import type { SafeUser } from '@/types';
import { useAuth } from '@/components/providers/auth-context';
import { ProfileModal } from '@/components/settings/profile-modal';
import { PasswordModal } from '@/components/settings/password-modal';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

type UserMenuProps = {
  user: SafeUser | null;
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      toast.success('Sessão encerrada.');
      router.push('/login');
    },
    onError: () => {
      toast.error('Não foi possível sair. Tente novamente.');
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-left text-sm shadow-sm transition hover:bg-slate-100"
      >
        <Avatar name={user.name} src={user.avatarUrl} />
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="font-medium text-slate-900">{user.name}</span>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
        <ChevronDown size={16} className="text-slate-500" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="border-t border-slate-200">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setProfileOpen(true);
                setOpen(false);
              }}
            >
              <Pencil size={16} />
              Editar perfil
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setPasswordOpen(true);
                setOpen(false);
              }}
            >
              <ShieldCheck size={16} />
              Alterar senha
            </button>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                logoutMutation.mutate();
                setOpen(false);
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                className="flex w-full items-center justify-start gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                loading={logoutMutation.isPending}
              >
                <LogOut size={16} />
                Sair
              </Button>
            </form>
          </div>
        </div>
      ) : null}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
      <PasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  );
}
