import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/services/api";
import { Game, Review } from "@/types";
import NotFound from "./NotFound";
import { Toaster } from "sonner";
import { GameHeader } from "@/components/game-details/GameHeader";
import GameCover from "@/components/game-details/GameCover";
import { GameInfo } from "@/components/game-details/GameInfo";
import { GameSidebar } from "@/components/game-details/GameSidebar";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { Skeleton } from "@/components/ui/skeleton";

// Backend compatibility
interface BackendGameResponse extends Omit<Game, 'rating' | 'reviewCount'> {
  average_rating?: number;
  review_count?: number;
  rating?: number;
  reviewCount?: number;
}

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGameData = async () => {
      if (!id) {
        setError(new Error("Game ID is required"));
        return;
      }

      try {
        setIsLoading(true);

        const [gameData, gameReviews] = await Promise.all([
          API.getGame(id) as Promise<BackendGameResponse>,
          API.getGameReviews(id),
        ]);

        setGame({
          ...gameData as Game,
          rating: gameData.rating || gameData.average_rating || 0,
          reviewCount: gameData.reviewCount || gameData.review_count || 0,
        });

        setReviews(gameReviews);
      } catch (error) {
        console.error("Failed to load game data:", error);
        setError(error instanceof Error ? error : new Error("Failed to load game data"));
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [id]);

  const handleReviewAdded = async (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);

    if (id) {
      try {
        const updatedGame = await API.getGame(id);
        setGame(prev => prev ? {
          ...prev,
          rating: updatedGame.rating || 0,
          reviewCount: updatedGame.reviewCount || 0,
        } : null);
      } catch (error) {
        console.error("Failed to update game rating:", error);
      }
    }
  };

  // Check if the user has already reviewed the game
  const hasUserReviewed = useMemo(() => {
    return !!user && reviews.some((r) => r.userId === user.id);
  }, [user, reviews]);

  if (error) return <NotFound />;

  if (isLoading || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-32 w-full mb-8" />
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <GameHeader game={game} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <GameCover coverImage={game.coverImage} title={game.title} />
          <GameInfo game={game} />
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <ReviewList reviews={reviews} />
            {user && !hasUserReviewed && (
              <ReviewForm gameId={game.id} onReviewAdded={handleReviewAdded} />
            )}
            {user && hasUserReviewed && (
              <p className="text-muted-foreground text-sm mt-4">
                You’ve already submitted a review for this game.
              </p>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <GameSidebar game={game} />
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
