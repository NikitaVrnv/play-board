// src/components/game-details/GameReviews.tsx
import { useState } from "react";
import { Review } from "@/types";
import { API } from "@/services/api";
import ReviewForm from "@/components/ReviewForm"; // Adjust path if needed
import { Separator } from "@/components/ui/separator";
import ReviewCard from "@/components/game-details/ReviewCard"; // Adjust path if needed
import { toast } from "@/components/ui/sonner"; // For error feedback

interface GameReviewsProps {
  gameId: string;
  reviews: Review[] | undefined; // Allow undefined from parent during loading
  hasUserReviewed: boolean;
  isLoggedIn: boolean;
  onReviewAdded: (review: Review) => void; // Callback for parent state update
}

export default function GameReviews({
  gameId,
  reviews = [], // Default to empty array if prop is undefined
  hasUserReviewed,
  isLoggedIn,
  onReviewAdded,
}: GameReviewsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure 'reviews' is treated as an array for rendering
  const reviewsArray = Array.isArray(reviews) ? reviews : [];

  const handleSubmitReview = async (rating: number, comment: string) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting review:", { gameId, rating, comment });
      // Correct API call: pass parameters separately
      const newReview = await API.addReview(gameId, rating, comment);
      console.log("Review submitted successfully:", newReview);
      // Call the parent handler to update the state there
      onReviewAdded(newReview);
      // No need to return newReview here unless ReviewForm needs it
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", { description: error.message });
      // Re-throw or handle error appropriately in ReviewForm if needed
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Reviews</h3>
        {/* Display count based on the safe array */}
        <div className="text-muted-foreground">
          {reviewsArray.length} {reviewsArray.length === 1 ? "review" : "reviews"}
        </div>
      </div>

      {/* Show review form only if logged in and hasn't reviewed */}
      {isLoggedIn && !hasUserReviewed && (
        <>
          <div className="mb-8 p-6 border rounded-lg bg-card">
            <h4 className="text-xl font-medium mb-4">Write Your Review</h4>
            {/* Pass the submit handler to the form */}
            <ReviewForm
              isSubmitting={isSubmitting}
              onSubmitReview={handleSubmitReview}
              // Add any other props ReviewForm might need (e.g., gameId)
            />
          </div>
          <Separator className="my-8" />
        </>
      )}

      {/* Display reviews or empty state */}
      <div className="space-y-6">
        {reviewsArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground italic">
            {/* Adjust empty state message based on login/review status */}
            {isLoggedIn && !hasUserReviewed
              ? "No reviews yet. Be the first to share your thoughts!"
              : "No reviews yet for this game."}
          </div>
        ) : (
          // Map over the safe array
          reviewsArray.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </section>
  );
}