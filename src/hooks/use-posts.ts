import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

export interface Post {
  _id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  image_url: string;
  generate_image: boolean;
  prompt?: string;
  status: "pending" | "done";
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usePosts = (
  status: "pending" | "done",
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ["posts", status],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<PostsResponse>(
        `/posts?status=${status}&page=${pageParam}&limit=9`,
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 0,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: Partial<Post>) => {
      const { data } = await api.post<{ post: Post }>("/posts", postData);
      return data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Post created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      postData,
    }: {
      id: string;
      postData: Partial<Post>;
    }) => {
      const { data } = await api.patch<{ post: Post }>(
        `/posts/${id}`,
        postData,
      );
      return data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Post deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });
};
