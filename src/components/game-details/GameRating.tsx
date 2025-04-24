import { Star } from "lucide-react";

interface GameRatingProps {
  rating: number;
  reviewCount: number;
}

const GameRating = ({ rating, reviewCount }: GameRatingProps) => {
  const hasReviews = reviewCount > 0;

  return (
    <div className="flex items-center bg-card border border-muted px-3 py-2 rounded-md">
      {hasReviews ? (
        <>
          <div className="flex items-center gap-1 mr-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <div>
            <span className="font-bold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm ml-1">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </>
      ) : (
        <span className="text-muted-foreground">Not yet rated</span>
      )}
    </div>
  );
};

export default GameRating;
