import { Game } from "@/types";

interface GameHeaderProps {
  game: Game;
}

export function GameHeader({ game }: GameHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{game.developer}</span>
        <span>•</span>
        <span>{game.genres[0]}</span>
        {game.releaseDate && (
          <>
            <span>•</span>
            <span>Released: {new Date(game.releaseDate).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </div>
  );
}
