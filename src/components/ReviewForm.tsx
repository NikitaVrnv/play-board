import { useState } from "react";
import { Review } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  gameId: string;
  onReviewAdded: (review: Review) => void;
}

export function ReviewForm({ gameId, onReviewAdded }: ReviewFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      content: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) return;
  
    try {
      setIsSubmitting(true);
      const newReview = await API.addReview({
        gameId: gameId,
        rating: data.rating,
        comment: data.content, // Make sure this matches the backend's 'comment' field
      });
  
      onReviewAdded(newReview);
      reset();
      toast.success("Review added successfully");
    } catch (error) {
      console.error("Failed to add review:", error);
      toast.error("Failed to add review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Please sign in to leave a review
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => reset({ rating: star })}
              className={`text-2xl ${
                star <= watch("rating") ? "text-yellow-500" : "text-muted"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Review</label>
        <Textarea
          {...register("content")}
          className="min-h-[100px]"
          placeholder="Write your review..."
        />
        {errors.content && (
          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}