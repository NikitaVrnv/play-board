// src/pages/Index.tsx
import { useEffect, useState, Fragment } from "react";
import HeroSection from "@/components/HeroSection";
import GameFilter from "@/components/GameFilter";
import GameCard from "@/components/GameCard";
import { API } from "@/services/api";
import { Game, Genre, SortOption } from "@/types";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | undefined>>({
     sort: "newest" as SortOption,
     genre: undefined,
     search: undefined,
  });

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching games with filters:", filters);
        const list = await API.getGames(filters);
        console.log(`Fetched ${list.length} games`);
        setGames(list || []);
      } catch (error: any) {
        console.error("Failed to fetch games:", error);
        toast.error("Failed to load games", { description: error.message });
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, [filters]);

  const handleFilterChange = (newFilters: {
    genre?: Genre;
    search?: string;
    sort?: SortOption;
  }) => {
    setFilters({
       genre: newFilters.genre,
       search: newFilters.search || undefined,
       sort: newFilters.sort || ("newest" as SortOption),
    });
  };

  return (
    <Fragment>
      <HeroSection />
      <div className="container py-8">
        <header className="mb-8 flex flex-col items-start justify-between">
          <h1 className="mb-2 text-3xl font-bold">Games Collection</h1>
          <p className="text-muted-foreground">
            Browse and discover the latest and greatest games. Read reviews and
            add your own!
          </p>
        </header>

        <GameFilter onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card shadow-sm animate-pulse">
                <div className="aspect-[3/2] w-full bg-muted rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-6 w-3/4 rounded-md bg-muted" />
                  <div className="h-4 w-1/2 rounded-md bg-muted" />
                  <div className="h-4 w-1/4 rounded-md bg-muted mb-2" />
                  <div className="h-4 w-full rounded-md bg-muted" />
                  <div className="h-4 w-5/6 rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium">No games found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default Index;