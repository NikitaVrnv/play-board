// src/components/GameCard.tsx
import { Game } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  // ONLY check reviewCount - ignore averageRating completely
  // This is critical to ensure consistency with the detail page
  const hasReviews = typeof game.reviewCount === 'number' && game.reviewCount > 0;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <Link to={`/games/${game.id}`} className="flex-shrink-0">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img
            src={game.coverImage || "/placeholder-game.jpg"}
            alt={game.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-game.jpg";
            }}
          />
        </div>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link to={`/games/${game.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg truncate">{game.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground truncate">
          {game.genre || "Uncategorized"}
        </p>
        {game.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {game.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-auto">
        <div className="text-sm text-muted-foreground truncate max-w-[60%]">
          {game.createdBy?.username || game.company?.name || "Unknown Developer"}
        </div>
        
        {/* ONLY show rating if hasReviews is true */}
        {hasReviews ? (
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {game.averageRating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default GameCard;