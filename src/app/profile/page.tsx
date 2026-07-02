'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { useUser } from '@/hooks/use-auth';
import { useUpdateName } from '@/hooks/use-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type NameFormValues = z.infer<typeof nameSchema>;

export default function ProfilePage() {
  const { data: user } = useUser();
  const updateName = useUpdateName();

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
  });

  useEffect(() => {
    if (user?.name) {
      nameForm.reset({ name: user.name });
    }
  }, [user, nameForm]);

  const onNameSubmit = (data: NameFormValues) => {
    updateName.mutate(data);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'} className="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account details and security
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your display name
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {user?.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="size-20 rounded-full object-cover border-4 border-muted shrink-0" 
                  />
                ) : (
                  <div className="size-20 rounded-full bg-muted flex items-center justify-center border-4 border-background shrink-0">
                    <span className="text-2xl text-muted-foreground font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}

                <div className="flex-1 w-full max-w-md space-y-4">
                  <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="flex items-end gap-4 w-full">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium">Name</label>
                      <Input {...nameForm.register('name')} />
                      {nameForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{nameForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <Button type="submit" disabled={updateName.isPending || !nameForm.formState.isDirty}>
                      {updateName.isPending ? 'Saving...' : 'Save Name'}
                    </Button>
                  </form>
                  
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium text-muted-foreground">Email (from LinkedIn)</label>
                    <Input value={user?.email || ''} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
                  </div>

                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium text-muted-foreground">Joined On</label>
                    <Input 
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : ''} 
                      readOnly 
                      disabled 
                      className="bg-muted/50 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
