"use client";

import { ShieldAlert, ChevronRight } from "lucide-react";
import { LinkedInIcon } from "@/components/common/linkedin-icon";
import { AppBadge } from "@/components/common/badge";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUser } from "@/hooks/use-auth";
import { useUpdateName, useDeleteAccount } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { AppInputField, SubmitButton } from "@/components/ui/form-fields";
import { DeleteConfirmModal } from "@/components/common/delete-confirm-modal";

const NAV = [
  { id: "account", label: "Account Settings" },
  { id: "linkedin", label: "LinkedIn Connection" },
  { id: "password", label: "Change Password" },
  { id: "danger", label: "Danger Zone" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const { data } = useUser();
  const user = data?.user;
  const quota = data?.quota;
  const updateName = useUpdateName();
  const deleteAccount = useDeleteAccount();

  const [active, setActive] = useState("account");
  const [name, setName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  const save = () => {
    if (name && name !== user.name) {
      updateName.mutate({ name });
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate();
  };

  // Calculate token health based on exact same logic from dashboard
  const expiresAt = user.linkedin_token_expires_at;
  let tokenDaysLeft = 0;
  if (expiresAt) {
    tokenDaysLeft = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  }
  const tokenHealthy = tokenDaysLeft >= 7;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and connected services.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside>
            <div className="p-5 bg-card rounded-2xl border">
              <div className="flex flex-col items-center text-center">
                {user.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="flex h-16 w-16 items-center justify-center rounded-full object-cover shadow-lg border-4 border-primary/20"
                  />
                ) : (
                  <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-primary-foreground shadow-lg">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="mt-3 text-sm font-semibold text-foreground">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              {NAV.map((n) => {
                const isActive = active === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActive(n.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex items-center gap-2 ${n.id === "danger" ? "text-destructive/80" : ""}`}
                    >
                      {n.id === "danger" && <ShieldAlert size={14} />}
                      {n.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${isActive ? "translate-x-0.5 text-primary" : "opacity-40"}`}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-5">
            {active === "account" && (
              <Section
                title="Account Settings"
                description="Update how you appear across PostFlow."
              >
                <div className="space-y-4">
                  <AppInputField
                    label="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-md"
                  />
                  <AppInputField
                    label="Email"
                    disabled
                    value={user.email}
                    className="max-w-md opacity-60 cursor-not-allowed"
                  />
                  <SubmitButton
                    onClick={save}
                    disabled={updateName.isPending || name === user.name}
                    isPending={updateName.isPending}
                    loadingText="Saving…"
                  >
                    Save
                  </SubmitButton>
                </div>
              </Section>
            )}

            {active === "linkedin" && (
              <Section
                title="LinkedIn Connection"
                description="Your posts publish through this connected account."
              >
                <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <LinkedInIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        Connected as {user.name}
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                      </div>
                      <div
                        className={`mt-0.5 font-mono text-[11px] ${tokenHealthy ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {expiresAt
                          ? `Token expires in ${tokenDaysLeft} days`
                          : "Token status unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        window.location.href = "/api/auth/linkedin";
                      }}
                      className="bg-transparent hover:bg-secondary"
                      style={{
                        borderColor: "var(--linkedin)",
                        color: "#4aa3d1",
                      }}
                    >
                      Reconnect
                    </Button>
                  </div>
                </div>
              </Section>
            )}

            {active === "password" && (
              <Section
                title="Change Password"
                description="Currently you sign in with LinkedIn only."
                badge="Coming soon"
              >
                <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    Password-based sign-in isn't available yet. You'll be
                    notified when it ships.
                  </p>
                </div>
              </Section>
            )}

            {active === "danger" && (
              <Section
                title="Danger Zone"
                description="Irreversible actions. Proceed with caution."
                tone="destructive"
              >
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">
                        Delete Account
                      </div>
                      <div className="text-xs text-muted-foreground">
                        This will permanently delete all your posts and data.
                        {quota && quota.used >= quota.limit && (
                          <div className="mt-2 text-amber-500 font-medium">
                            Cannot delete account while all your post slots are
                            full.
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={quota ? quota.used >= quota.limit : false}
                      className="bg-transparent border-destructive text-destructive hover:bg-destructive hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        title="Delete Account"
        description="Are you sure you want to permanently delete your account, posts, and notifications? This action cannot be undone."
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isPending={deleteAccount.isPending}
      />
    </ProtectedRoute>
  );
}

function Section({
  title,
  description,
  badge,
  tone,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  tone?: "destructive";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${tone === "destructive" ? "border-destructive/30 bg-card" : "border-border bg-card"} shadow-sm space-y-5`}
    >
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {badge && <AppBadge>{badge}</AppBadge>}
      </div>
      {children}
    </section>
  );
}
