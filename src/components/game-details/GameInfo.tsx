// src/components/game-details/GameInfo.tsx
import { Game } from "@/types";
import GameRating from "./GameRating";
import { formatDate } from "@/utils/dateUtils";

interface GameInfoProps {
  game: Game;
}

const GameInfo = ({ game }: GameInfoProps) => {
  // Add the 5.0 rating fix here too
  const displayRating = game.averageRating === 5 || (game.averageRating > 4.9 && game.averageRating < 5)
    ? 5.0
    : game.averageRating || 0;
    
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{game.title}</h1>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>{game.author}</span>
          <span>•</span>
          <span>{game.genre}</span>
          {game.releaseDate && (
            <>
              <span>•</span>
              <span>Released: {formatDate(game.releaseDate)}</span>
            </>
          )}
        </div>
      </div>
      <GameRating rating={displayRating} reviewCount={game.reviewCount || 0} />
    </div>
  );
};

export default GameInfo;