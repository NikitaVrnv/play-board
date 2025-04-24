// src/components/game-details/GameHeader.tsx
import { Game } from "@/types";
import React from "react";

export interface GameHeaderProps {
  game: Game;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold py-4">{game.title}</h1>
      <p className="text-sm text-muted-foreground">
        Released on {new Date(game.releaseDate).toLocaleDateString()}
      </p>
    </div>
  );
};

export default GameHeader;
