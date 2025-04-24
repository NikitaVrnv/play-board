import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { AddGameForm } from "@/components/AddGameForm";

const AddGame = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Add a New Game</h1>
      <p className="text-muted-foreground mb-8">
        Fill out the form below to add a new game to the collection.
      </p>
      
      <div className="max-w-3xl">
        <AddGameForm onGameAdded={() => {/* логика после добавления */}} />
      </div>
    </div>
  );
};

export default AddGame;
