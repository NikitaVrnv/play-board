// src/components/game-details/GameSidebar.tsx
import { Game } from "../../types";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface GameSidebarProps {
  game: Game;
  reviewCount: number;
  onReadReviews: () => void;
}

const GameSidebar = ({ game, reviewCount, onReadReviews }: GameSidebarProps) => {
  const hasReviews = reviewCount > 0;
  
  // Handle displaying developer/publisher information
  const getDeveloperPublisher = () => {
    if (game.createdBy?.username) {
      return game.createdBy.username;
    } else if (game.company?.name) {
      return game.company.name;
    } else {
      return "Unknown";
    }
  };
  
  // Fix rating display logic to ensure 5-star ratings show as 5.0
  const displayRating = game.averageRating === 5 || (game.averageRating > 4.9 && game.averageRating < 5) 
    ? 5.0 
    : game.averageRating;
  
  return (
    <div className="sticky top-24 bg-card rounded-lg border p-6">
      <h3 className="text-xl font-semibold mb-4">Game Details</h3>
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Developer/Publisher</h4>
          <p>{getDeveloperPublisher()}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Genre</h4>
          <p>{game.genre || "Not specified"}</p>
        </div>
        {game.releaseDate && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Release Date</h4>
            <p>{formatDate(game.releaseDate)}</p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Rating</h4>
          <div className="flex items-center mt-1">
            {hasReviews ? (
              <>
                <div className="flex items-center gap-1 mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(displayRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">
                  {displayRating.toFixed(1)} ({reviewCount})
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Not yet rated</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t">
        <Button className="w-full" onClick={onReadReviews}>
          {reviewCount > 0
            ? `Read ${reviewCount} ${reviewCount === 1 ? "Review" : "Reviews"}`
            : "Be the first to review"}
        </Button>
      </div>
    </div>
  );
};

export default GameSidebar;