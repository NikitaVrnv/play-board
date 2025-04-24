import { useEffect, useState, useCallback } from "react";
import { API } from "@/services/api";
import { Game, Genre, SortOption } from "@/types";
import { GameCard } from "@/components/GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import GameFilter from "@/components/GameFilter";

// Module-level cache to maintain state between navigations
let cachedGames: Game[] = [];

export default function Index() {
  // State with initial values from cache
  const [games, setGames] = useState<Game[]>(cachedGames);
  const [displayedGames, setDisplayedGames] = useState<Game[]>(cachedGames);
  const [isInitialLoading, setIsInitialLoading] = useState(cachedGames.length === 0);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // Load games only once on initial mount
  useEffect(() => {
    const loadInitialGames = async () => {
      // Only fetch if we don't have cached data
      if (cachedGames.length === 0) {
        try {
          const fetchedGames = await API.getGames();
          setGames(fetchedGames || []);
          setDisplayedGames(fetchedGames || []);
          cachedGames = fetchedGames || []; // Update module cache
        } catch (error) {
          console.error("Failed to load games:", error);
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        // We already have cached data, so just ensure loading is false
        setIsInitialLoading(false);
      }
    };
    
    loadInitialGames();
  }, []);
  
  // Memoize the filter handler to prevent unnecessary recreations
  const handleFilterChange = useCallback(async (filters: {
    genre?: Genre;
    search?: string;
    sort?: SortOption
  }) => {
    // Don't show loading skeleton if we already have data
    // This prevents the UI from blinking
    setIsFilterLoading(true);
    
    try {
      const filteredGames = await API.getGames(filters);
      setDisplayedGames(filteredGames || []);
      
      // Update our module cache with the latest filtered results
      if (!filters.genre && !filters.search && !filters.sort) {
        cachedGames = filteredGames || [];
      }
    } catch (error) {
      console.error("Failed to load filtered games:", error);
      
      // If API fails, try to filter client-side as fallback
      if (games.length > 0) {
        let clientFiltered = [...games];
        
        if (filters.search) {
          clientFiltered = clientFiltered.filter(game => 
            game.title.toLowerCase().includes(filters.search?.toLowerCase() || '')
          );
        }
        
        if (filters.genre) {
          clientFiltered = clientFiltered.filter(game => 
            game.genres.includes(filters.genre as string)
          );
        }
        
        // Apply basic sorting
        if (filters.sort) {
          clientFiltered.sort((a, b) => {
            switch (filters.sort) {
              case 'newest':
                return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
              case 'oldest':
                return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
              case 'highest-rated':
                return b.rating - a.rating;
              case 'lowest-rated':
                return a.rating - b.rating;
              default:
                return 0;
            }
          });
        }
        
        setDisplayedGames(clientFiltered);
      } else {
        setDisplayedGames([]);
      }
    } finally {
      setIsFilterLoading(false);
    }
  }, [games]);
  
  // Determine what to show based on loading states and data
  const renderGamesList = () => {
    // Determine if we should show loading skeletons
    const showSkeleton = isInitialLoading && displayedGames.length === 0;
    
    if (showSkeleton) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      );
    }
    
    if (displayedGames.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No games found.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedGames.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            isLoading={isFilterLoading} // Optional: can dim or show loading indicator on cards
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Always show the filter - don't hide during loading */}
      <GameFilter 
        onFilterChange={handleFilterChange} 
        isLoading={isFilterLoading}
      />
      
      {/* Games grid with smart loading handling */}
      {renderGamesList()}
    </div>
  );
}