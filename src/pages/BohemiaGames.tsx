// src/pages/BohemiaGames.tsx
import { useEffect, useState } from "react";
import GameCard from "@/components/GameCard";
import { API } from "@/services/api";
import { Game } from "@/types";

export default function BohemiaGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bohemiaCompanyId, setBohemiaCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loadBohemiaCompany = async () => {
      try {
        // First, get all companies
        const companies = await API.getCompanies();
        // Find Bohemia Interactive
        const bohemia = companies.find(c => c.name === "Bohemia Interactive");
        if (bohemia) {
          setBohemiaCompanyId(bohemia.id);
        } else {
          setError("Bohemia Interactive company not found");
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load companies");
      }
    };

    loadBohemiaCompany();
  }, []);

  useEffect(() => {
    const loadBohemiaGames = async () => {
      if (!bohemiaCompanyId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // fetch all games
        const all = await API.getGames();
        // filter to Bohemia Interactive games
        const bohemia = all.filter((g) => g.companyId === bohemiaCompanyId);
        setGames(bohemia);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load games");
      } finally {
        setIsLoading(false);
      }
    };

    if (bohemiaCompanyId) {
      loadBohemiaGames();
    }
  }, [bohemiaCompanyId]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Bohemia Interactive Games</h1>

      {isLoading && (
        <div className="text-center py-12">
          <p>Loading games…</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-12">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">No games found for Bohemia Interactive.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}