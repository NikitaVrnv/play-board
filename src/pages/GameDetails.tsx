// src/pages/GameDetails.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { API } from "@/services/api";
import { Game, Review } from "../types"; // Ensure types match your definitions
import { useAuth } from "@/context/AuthContext";
import NotFound from "./NotFound";
import { toast } from "@/components/ui/sonner";
import GameHeader from "@/components/game-details/GameHeader"; // Ensure these components exist
import GameCover from "@/components/game-details/GameCover";   // and correctly use props
import GameInfo from "@/components/game-details/GameInfo";
import GameSidebar from "@/components/game-details/GameSidebar";
import GameReviews from "@/components/game-details/GameReviews";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function GameDetails() {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate(); // For redirecting if game not found
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Reset state on ID change
    setGame(null);
    setReviews([]);
    setError(null);
    setIsLoading(true);

    if (!gameId) {
      console.error("No game ID provided in URL");
      setError("Invalid game ID.");
      setIsLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates on unmounted component

    const loadGameData = async () => {
      try {
        console.log(`Fetching data for game ID: ${gameId}`);
        // Fetch game and reviews concurrently
        const [gameData, reviewsData] = await Promise.all([
          API.getGame(gameId),
          API.getReviews(gameId),
        ]);

        if (!isMounted) return; // Exit if component unmounted

        if (!gameData) {
          // Handle case where gameData is null/undefined from API
          console.error(`Game not found for ID: ${gameId}`);
          setError("Game not found.");
          // Optional: redirect to a 404 page or back
          // navigate('/404', { replace: true });
        } else {
          console.log("Game data received:", gameData);
          setGame(gameData);
        }

        console.log("Reviews received:", reviewsData);
        // Ensure reviews is always an array, even if API returns null/undefined
        setReviews(reviewsData || []);

      } catch (err: any) {
        if (!isMounted) return;
        console.error(`Failed to load game details for ${gameId}:`, err);
        setError(err.message || "Failed to load game details.");
        toast.error("Failed to load game details", { description: err.message });
         // If the error specifically means "not found", set error state accordingly
         if (err.message?.toLowerCase().includes('not found') || err.message?.includes('404')) {
             setError("Game not found.");
         }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGameData();

    // Cleanup function for when component unmounts or gameId changes
    return () => {
      isMounted = false;
    };
  }, [gameId, navigate]); // Add navigate to dependency array

  // Effect to scroll to reviews section if hash is present
  useEffect(() => {
    if (!isLoading && game && window.location.hash === "#reviews") {
      const timer = setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100); // Short delay to ensure rendering
      return () => clearTimeout(timer);
    }
  }, [isLoading, game, reviews]); // Depend on isLoading, game, and reviews

  // Handler for when a new review is added via the form
  const handleReviewAdded = (newReview: Review) => {
    // Add the new review to the top of the list
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    // Update game's average rating and review count if game data exists
    if (game) {
      const updatedReviews = [newReview, ...reviews]; // Use current reviews state
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = updatedReviews.length > 0
          ? Math.round((totalRating / updatedReviews.length) * 10) / 10
          : 0;

      setGame({
        ...game,
        averageRating: newAverage,
        reviewCount: updatedReviews.length,
      });
    }
    toast.success("Review submitted!", {
      description: "Thanks for your feedback 🎉",
    });
     // Optionally scroll to the new review
     setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
     }, 100);
  };

  // --- Render Logic ---

  if (isLoading) {
    // --- Loading Skeleton ---
    return (
      <div className="container py-8 animate-pulse">
        <Skeleton className="h-10 w-3/4 mb-4" /> {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-8">
            <Skeleton className="aspect-video w-full" /> {/* Cover */}
            <Skeleton className="h-8 w-1/4" /> {/* Info Title */}
            <Skeleton className="h-20 w-full" /> {/* Info Details */}
            <Skeleton className="h-8 w-1/4" /> {/* Description Title */}
            <Skeleton className="h-24 w-full" /> {/* Description Text */}
            <Skeleton className="h-8 w-1/4" /> {/* Reviews Title */}
            <Skeleton className="h-40 w-full" /> {/* Reviews Section */}
          </div>
          <aside className="w-full lg:w-1/3 space-y-4">
            <Skeleton className="h-64 w-full" /> {/* Sidebar */}
          </aside>
        </div>
      </div>
    );
  }

  if (error) {
    // --- Error State ---
    // If the specific error is "Game not found", render the NotFound component
    if (error === "Game not found.") {
        return <NotFound />;
    }
    // Otherwise, show a generic error message
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Game</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (!game) {
    // This case should ideally be covered by error state, but good as a fallback
    console.warn("Game data is null after loading without error.");
    return <NotFound />;
  }

  // --- Successful Render ---
  const hasUserReviewed = user
    ? reviews.some((r) => r.userId === user.id)
    : false;

  return (
    <div className="container py-8">
      {/* Ensure all these components correctly receive and use the 'game' prop */}
      <GameHeader game={game} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <GameCover coverImage={game.coverImage} title={game.title} />
          <GameInfo game={game} />
          {game.description && (
            <section className="mb-8 prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                {/* Using prose for better text formatting if needed */}
                <p className="text-foreground/90 leading-relaxed">
                    {game.description}
                </p>
            </section>
          )}
          {/* Reviews Section */}
          <div ref={reviewsRef} id="reviews">
            <GameReviews
              gameId={game.id}
              reviews={reviews} // Pass the state variable
              hasUserReviewed={hasUserReviewed}
              isLoggedIn={!!user} // Use !! to cast user to boolean
              onReviewAdded={handleReviewAdded}
            />
          </div>
        </div>
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3">
          <GameSidebar
            game={game}
            // Pass the current length of the reviews array
            reviewCount={reviews.length}
            onReadReviews={() =>
              reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        </aside>
      </div>
    </div>
  );
}
