'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { useNotifications, useMarkNotificationsRead } from '@/hooks/use-notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect, Fragment } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationsRead();

  useEffect(() => {
    // Mark notifications as read when visiting the page
    if (data?.pages && data.pages.length > 0) {
      const hasUnread = data.pages.some(page => page.notifications.some(n => !n.is_read));
      if (hasUnread) {
        markAsRead.mutate();
      }
    }
  }, [data, markAsRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-6 text-green-500" />;
      case 'error':
        return <XCircle className="size-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="size-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="size-6 text-blue-500" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'} className="shrink-0">
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Updates from your scheduled LinkedIn posts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : data?.pages[0].notifications.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card">
                <p className="text-muted-foreground">You don't have any notifications yet.</p>
              </div>
            ) : (
              <>
                {data?.pages.map((page, i) => (
                  <Fragment key={i}>
                    {page.notifications.map((notification) => (
                      <Card key={notification._id} className={`overflow-hidden transition-colors ${!notification.is_read ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                        <CardContent className="p-0">
                          <div className="flex items-start gap-4 p-5">
                            <div className="shrink-0 mt-1">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                                <h3 className="font-semibold text-lg leading-tight truncate">
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground break-words">
                                {notification.message}
                              </p>
                              {notification.post_title && (
                                <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                                  Post: {notification.post_title}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </Fragment>
                ))}
                
                {hasNextPage && (
                  <div className="pt-6 pb-10 flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()} 
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        'Load older notifications'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
