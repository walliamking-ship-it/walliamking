import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Layout from '@/components/Layout';
import { verifyToken } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // 检查是否已登录
  const cookieStore = await cookies();
  const token = cookieStore.get('erp_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect('/login');
  }

  return <Layout>{children}</Layout>;
}
