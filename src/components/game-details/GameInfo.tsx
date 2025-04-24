import { Game } from "@/types";
import { GameRating } from "@/components/GameRating";

interface GameInfoProps {
  game: Game;
}

export function GameInfo({ game }: GameInfoProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{game.title}</h2>
        {game.isEarlyAccess && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
            Early Access
          </span>
        )}
      </div>
      <GameRating rating={game.rating} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-muted-foreground">{game.description}</p>
      </div>
    </div>
  );
}
