import { useEffect, useState } from "react";
import { API } from "@/services/api";
import { Genre, SortOption } from "../types";  
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  onFilterChange: (f: {
    genre?: Genre;
    search?: string;
    sort?: SortOption;
  }) => void;
}

export default function GameFilter({ onFilterChange }: Props) {
  const [genres, setGenres] = useState<Genre[]>([]);
  // Change to use "all" instead of empty string
  const [g, setG] = useState<Genre | "all">("all");
  const [q, setQ] = useState("");
  const [s, setS] = useState<SortOption>("newest" as SortOption);
  const mobile = useIsMobile();

  useEffect(() => {
    API.getGenres().then(setGenres);
  }, []);

  useEffect(() => {
    onFilterChange({
      genre: g === "all" ? undefined : g as Genre,
      search: q,
      sort: s,
    });
  }, [g, q, s]);

  const content = (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search games…"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Genre</label>
          <Select value={g} onValueChange={(v) => setG(v as Genre | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any genre</SelectItem>
              {genres.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Sort</label>
          <Select value={s} onValueChange={(v) => setS(v as SortOption)}>
            <SelectTrigger>
              <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest-rated">Highest rated</SelectItem>
              <SelectItem value="lowest-rated">Lowest rated</SelectItem>
              <SelectItem value="most-reviewed">Most reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setG("all"); // Change from "" to "all"
          setQ("");
          setS("newest" as SortOption);
        }}
      >
        Clear filters
      </Button>
    </div>
  );

  if (mobile) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <Input
          className="pl-8 flex-1"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Filter the games list</SheetDescription>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return <div className="p-4 mb-6 bg-card rounded-lg">{content}</div>;
}
