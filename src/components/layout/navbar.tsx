"use client";

import Link from "next/link";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, LogOut, User as UserIcon, Menu } from "lucide-react";
import { LogoHeader } from "./logo-header";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const MOBILE_NAV_ITEMS = [
  { href: "/posts", label: "Posts" },
  { href: "/suggestions", label: "Suggestions" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const { data } = useUser();
  const user = data?.user;
  const logout = useLogout();

  const pathname = usePathname();
  const router = useRouter();

  const { data: notifData } = useNotifications(!!user);

  const unread =
    notifData?.pages.flatMap((p) => p.notifications).filter((n) => !n.is_read)
      .length ?? 0;

  if (!user)
    return (
      <header className="fixed inset-x-0 top-0 z-40 py-4 bg-background/20 backdrop-blur-xl border-b">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
          <Link href="/posts">
            <LogoHeader />
          </Link>
        </div>
      </header>
    );

  return (
    <header className="fixed inset-x-0 top-0 z-40 py-4 bg-background/20 backdrop-blur-xl border-b">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="md:hidden flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-card border-border/50 p-5 flex flex-col gap-5"
            >
              <SheetHeader className="p-0 text-left">
                <SheetTitle>
                  <LogoHeader />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 pt-5 border-t">
                {MOBILE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors p-3 rounded-lg flex items-center justify-between gap-3",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {item.href === "/notifications" && unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/posts">
            <LogoHeader />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/posts"
            className={cn(
              "hidden text-sm transition-colors md:block",
              pathname === "/posts"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Posts
          </Link>

          <Link
            href="/suggestions"
            className={cn(
              "hidden text-sm transition-colors md:block",
              pathname === "/suggestions"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Suggestions
          </Link>

          {/* Notification Bell → links to /notifications page */}
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread === 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-semibold text-white ring-2 ring-background">
                {unread}
              </span>
            )}
          </Link>

          {/* User Avatar — shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white ring-2 ring-transparent transition hover:ring-primary/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {user.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profile_picture}
                  alt="Avatar"
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                getInitials(user.name ?? "U")
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#0B1120]/80 bg-card backdrop-blur-xl"
            >
              {/* User info header */}
              <div className="px-2 py-2.5 select-none truncate">
                <div className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex items-center gap-2 p-2 text-sm text-muted-foreground cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <UserIcon />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2.5 p-2 text-sm cursor-pointer"
                onClick={() => logout.mutate()}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
