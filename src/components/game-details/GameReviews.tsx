import { useAuth } from "@/hooks/useAuth";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { Link } from "react-router-dom";

interface GameReviewsProps {
  gameId: string;
  reviews: Review[];
  onReviewAdded: (review: Review) => void;
}

const GameReviews = ({ 
  gameId, 
  reviews, 
  onReviewAdded 
}: GameReviewsProps) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const hasUserReviewed = isLoggedIn
    ? reviews.some((review) => review.userId === user?.id)
    : false;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>

      {isLoggedIn && !hasUserReviewed && (
        <ReviewForm gameId={gameId} onReviewAdded={onReviewAdded} />
      )}

      {!isLoggedIn && (
        <div className="mb-6 p-6 bg-card/50 rounded-lg text-center border border-muted/50 shadow-sm">
          <p className="text-muted-foreground">Please log in to submit a review</p>
          <Button className="mt-4" asChild>
            <Link to="/login">Login to Review</Link>
          </Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameReviews;
