import { Star } from "lucide-react";

interface GameRatingProps {
  rating: number;
  reviewCount: number;
}

const GameRating = ({ rating, reviewCount }: GameRatingProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-sm">
        {rating.toFixed(1)} ({reviewCount} reviews)
      </span>
    </div>
  );
};

export default GameRating;
