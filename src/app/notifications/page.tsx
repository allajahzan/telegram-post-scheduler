"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useEffect, Fragment } from "react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotifications();
  const markAsRead = useMarkNotificationsRead();

  useEffect(() => {
    // Mark notifications as read when visiting the page
    if (data?.pages && data.pages.length > 0) {
      const hasUnread = data.pages.some((page) =>
        page.notifications.some((n) => !n.is_read),
      );
      if (hasUnread) {
        markAsRead.mutate();
      }
    }
  }, [data, markAsRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="size-5 text-emerald-500" />;
      case "error":
        return <AlertCircle className="size-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="size-5 text-amber-500" />;
      default:
        return <AlertCircle className="size-5 text-blue-500" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl w-full px-6 py-10">
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Updates from your scheduled LinkedIn posts.
        </p>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin mb-4 text-primary" />
              <p>Loading your notifications...</p>
            </div>
          ) : data?.pages[0].notifications.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <p className="text-xs text-muted-foreground">
                You don't have any notifications yet.
              </p>
            </div>
          ) : (
            <>
              {data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`rounded-2xl border p-5 transition-colors ${
                        !notification.is_read
                          ? "border-primary/20 bg-primary/5"
                          : "border-border/50 bg-card/40 hover:bg-card/60"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-foreground text-sm">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
                            {notification.message}
                          </p>
                          <span className="text-[12px] text-muted-foreground/60 mt-1.5">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </Fragment>
              ))}

              {hasNextPage && (
                <div className="pt-6 pb-10 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="min-w-[140px]"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
