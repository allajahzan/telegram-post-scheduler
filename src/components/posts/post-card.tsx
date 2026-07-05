import { Calendar, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { Post } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { StatusBadge, AppBadge } from "@/components/common/badge";

// ── Empty Slot Card ───────────────────────────────────────────────────────────

export function EmptySlotCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-all duration-200 hover:border-primary hover:bg-card/50"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-all group-hover:border-primary group-hover:text-primary">
        <Plus size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Empty slot</p>
        <p className="mt-0.5 text-sm font-semibold text-primary">
          Schedule a post
        </p>
      </div>
    </button>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  index: number;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function PostCard({ post, index, onEdit, onDelete }: PostCardProps) {
  const isPending = post.status === "pending";

  return (
    <div className="group flex min-h-[260px] flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 shadow-2xl hover:shadow-lg hover:shadow-primary/5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          #P{index + 1}
        </span>
        <StatusBadge status={post.status} />
      </div>

      {/* Content — clickable to edit */}
      <button
        onClick={() => isPending && onEdit(post)}
        // disabled={!isPending}
        className="h-full flex flex-col gap-2 items-start text-start disabled:cursor-default"
      >
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
      </button>

      {/* Footer */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={12} />
            <span className="font-mono">{post.date}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span className="font-mono">{post.time} IST</span>
          </span>
          {post.image_url ? (
            <AppBadge>🖼️ Custom Image</AppBadge>
          ) : post.generate_image ? (
            <AppBadge>🖼️ AI Generated Image</AppBadge>
          ) : (
            <AppBadge>No Image</AppBadge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(post)}
            // disabled={!isPending}
            title={!isPending ? "Cannot edit a published post" : "Edit post"}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post)}
            title={
              !isPending ? "Cannot delete a published post" : "Delete post"
            }
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
