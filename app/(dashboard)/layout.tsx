import { redirect } from 'next/navigation';
import { AuthProvider } from '@/components/providers/auth-context';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
