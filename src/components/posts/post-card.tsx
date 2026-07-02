import { Post } from '@/hooks/use-posts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Image as ImageIcon, Sparkles, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const isPending = post.status === 'pending';

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-border/50">
      <CardHeader className="p-4 pb-2 flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1" title={post.title}>
            {post.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>{post.time}</span>
            </div>
          </div>
        </div>
        <Badge 
          variant={isPending ? 'outline' : 'secondary'}
          className={isPending ? 'border-(--color-status-pending) text-(--color-status-pending)' : 'bg-(--color-status-completed) text-white hover:bg-status-completed/90'}
        >
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {post.description}
        </p>

        {(post.image_url || post.generate_image) && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1.5 rounded-md w-fit">
            {post.generate_image ? (
              <>
                <Sparkles className="size-3.5" />
                AI Image Generated
              </>
            ) : (
              <>
                <ImageIcon className="size-3.5" />
                Custom Image Attached
              </>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-4 gap-2 border-t mt-auto">
        <Button 
          variant="secondary" 
          className="flex-1 gap-2" 
          onClick={() => onEdit(post)}
        >
          <Edit className="size-4" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1 gap-2" 
          onClick={() => onDelete(post)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
