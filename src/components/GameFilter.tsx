import { useState, useEffect, FormEvent, useCallback } from "react";
import { Genre, SortOption } from "@/types";
import { API } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GameFilterProps {
  onFilterChange: (filters: {
    genre?: Genre;
    search?: string;
    sort?: SortOption;
  }) => void;
  isLoading?: boolean;
}

// Module-level cache for genres
let cachedGenres: Genre[] = [];

export default function GameFilter({ onFilterChange, isLoading = false }: GameFilterProps) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [genres, setGenres] = useState<Genre[]>(cachedGenres);
  const [isGenresLoading, setIsGenresLoading] = useState(cachedGenres.length === 0);

  // Load genres once
  useEffect(() => {
    const loadGenres = async () => {
      if (cachedGenres.length === 0) {
        try {
          const genreData = await API.getGenres();
          setGenres(genreData);
          cachedGenres = genreData; // Update module cache
        } catch (error) {
          console.error("Failed to load genres:", error);
        } finally {
          setIsGenresLoading(false);
        }
      } else {
        setIsGenresLoading(false);
      }
    };

    loadGenres();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Define applyFilters as useCallback to avoid the exhaustive deps warning
  const applyFilters = useCallback(() => {
    onFilterChange({
      search: search || undefined,
      genre: genre === "all" ? undefined : (genre as Genre),
      sort,
    });
  }, [onFilterChange, search, genre, sort]);

  // Apply filters when sort or genre changes
  useEffect(() => {
    applyFilters();
  }, [sort, genre, applyFilters]); // Added applyFilters to dependency array

  return (
    <div className="mb-8 p-4 bg-muted/40 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          {isGenresLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={genre}
              onValueChange={(value) => setGenre(value as Genre)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="w-full md:w-48">
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
              <SelectItem value="most-reviewed">Most Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Filtering..." : "Filter"}
        </Button>
      </form>
    </div>
  );
}