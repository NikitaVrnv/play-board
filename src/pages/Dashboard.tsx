import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/services/api";
import { Game, Review } from "@/types";
import { GameCard } from "@/components/GameCard";
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [games, reviews] = await Promise.all([
          API.getGames({ author: user.username }),
          API.getReviews(user.id),
        ]);
        setUserGames(games);
        setUserReviews(reviews);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold">Welcome back, {user.username}!</h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your games.</p>
          <h2 className="text-2xl font-semibold mb-4">Your Games</h2>
          {userGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <p>You haven&apos;t added any games yet.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Reviews</h2>
          {userReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p>You haven&apos;t written any reviews yet.</p>
          )}
        </section>
      </div>
    </div>
  );
} 