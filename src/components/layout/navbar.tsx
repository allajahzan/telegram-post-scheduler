'use client';

import Link from 'next/link';
import { useUser, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Briefcase, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { data } = useUser();
  const user = data?.user;
  const logout = useLogout();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
          <Link href="/dashboard" className="text-xl font-bold text-primary tracking-tight">
            LinkedIn Scheduler
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/notifications">
            <Button variant={pathname === '/notifications' ? 'secondary' : 'ghost'} size="icon" className="relative">
              <Bell className="size-5" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant={pathname === '/profile' ? 'secondary' : 'ghost'} size="sm" className="gap-2">
              {user.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_picture} alt="Profile" className="size-5 rounded-full object-cover" />
              ) : (
                <UserIcon className="size-4" />
              )}
              <span className="hidden sm:inline-block">{user.name}</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive gap-2"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline-block">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
