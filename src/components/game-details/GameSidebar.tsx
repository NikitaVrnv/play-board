import { Game } from "@/types";
import { Badge } from "@/components/ui/badge";

interface GameSidebarProps {
  game: Game;
}

export function GameSidebar({ game }: GameSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Game Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Developer</h4>
            <p>{game.developer}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Publisher</h4>
            <p>{game.publisher}</p>
          </div>
          
          {game.releaseDate && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Release Date</h4>
              <p>{new Date(game.releaseDate).toLocaleDateString()}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Genres</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {game.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Rating</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 font-medium">{game.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({game.reviewCount}+ reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
