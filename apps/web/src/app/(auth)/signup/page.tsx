import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Kayıt Ol' };

export default function SignupPage() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle>Hediye listeni oluştur</CardTitle>
        <CardDescription>Birkaç dakikada düğün hediye listeni hazırla.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
