import Layout from '@/components/Layout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // 临时禁用登录验证
  return <Layout>{children}</Layout>;
}
