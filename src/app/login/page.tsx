'use client';

import { useUser } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLinkedInLogin = () => {
    // Redirect to our LinkedIn Auth API route
    window.location.href = '/api/auth/linkedin';
  };

  if (isLoading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back to Post Scheduler</CardTitle>
          <CardDescription>
            Authenticate securely to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            onClick={handleLinkedInLogin} 
            className="w-full gap-2 bg-linkedin hover:bg-linkedin-dark text-white" 
            size="lg"
          >
            <Briefcase className="size-5" />
            Login with LinkedIn
          </Button>
          <p className="text-xs text-center text-muted-foreground px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy. New accounts will be created automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
