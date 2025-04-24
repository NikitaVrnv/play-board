import { Game } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface GameCardProps {
  game: Game;
  isLoading?: boolean; // Add optional loading prop
}

export function GameCard({ game, isLoading = false }: GameCardProps) {
  // Format price display
  const formatPrice = () => {
    if (game.isFree) return "Free";
    if (game.discountPercent && game.discountPercent > 0) {
      const discountedPrice = game.price * (1 - game.discountPercent / 100);
      return (
        <div className="flex items-center gap-2">
          <span className="line-through text-muted-foreground">${game.price.toFixed(2)}</span>
          <span className="font-medium">${discountedPrice.toFixed(2)}</span>
          <Badge variant="destructive" className="ml-1">-{game.discountPercent}%</Badge>
        </div>
      );
    }
    return `$${game.price.toFixed(2)}`;
  };

  return (
    <Link 
      to={`/games/${game.id}`}
      className={`transition-opacity duration-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={game.coverImage || '/placeholder-game.jpg'}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {game.isEarlyAccess && (
            <Badge className="absolute top-2 left-2 bg-amber-500">Early Access</Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg line-clamp-1">{game.title}</h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-sm">{game.rating.toFixed(1)}</span>
              <span>★</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {game.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {game.description || "No description available."}
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-0">
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">by</span>
            <span className="font-medium">{game.developer}</span>
          </div>
          <div className="font-semibold">{formatPrice()}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
