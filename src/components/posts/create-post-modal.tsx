import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreatePost } from '@/hooks/use-posts';
import { useEffect } from 'react';

const postSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 chars)'),
  description: z.string().min(5, 'Description is required (min 5 chars)'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  image_url: z.string().optional(),
  generate_image: z.boolean(),
  prompt: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const createPost = useCreatePost();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      generate_image: false,
    }
  });

  const imageUrl = watch('image_url');
  const generateImage = watch('generate_image');

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: PostFormValues) => {
    createPost.mutate(data, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Schedule a new post for LinkedIn. It will be marked as pending.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time (IST)</label>
              <Input type="time" {...register('time')} />
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Enter post title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="What do you want to share?" 
              className="resize-none min-h-[100px]"
              {...register('description')} 
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">AI Rewrite Prompt (Optional)</label>
            <Textarea 
              placeholder="Instructions for AI to rewrite title and description..." 
              className="resize-none min-h-[60px]"
              {...register('prompt')} 
            />
            {errors.prompt && <p className="text-xs text-destructive">{errors.prompt.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL (Optional)</label>
            <Input 
              placeholder="Paste Google Drive shareable link" 
              {...register('image_url')} 
              disabled={generateImage}
            />
            <p className="text-xs text-muted-foreground">Or leave blank and use AI generation</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 border p-3 rounded-md bg-secondary/30">
              <input 
                type="checkbox" 
                id="generate_image" 
                className="size-4 text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!imageUrl}
                {...register('generate_image')} 
              />
              <label htmlFor="generate_image" className={`text-sm font-medium leading-none ${!!imageUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                Generate Image with AI
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? 'Saving...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
