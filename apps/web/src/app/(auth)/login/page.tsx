import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Giriş Yap' };

export default function LoginPage() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle>Tekrar hoş geldin</CardTitle>
        <CardDescription>Hediye listeni yönetmek için giriş yap.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
