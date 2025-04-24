import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import { Game } from "@/types";
import { toast } from "sonner";

const gameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().url("Invalid URL"),
  releaseDate: z.string().min(1, "Release date is required"),
  developer: z.string().min(1, "Developer is required"),
  publisher: z.string().min(1, "Publisher is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  price: z.number().min(0, "Price must be non-negative"),
  isFree: z.boolean(),
  isEarlyAccess: z.boolean(),
  isMultiplayer: z.boolean(),
  isSinglePlayer: z.boolean(),
  isCoop: z.boolean(),
  isOnline: z.boolean(),
  isOffline: z.boolean(),
  isCrossPlatform: z.boolean(),
  isVR: z.boolean(),
  minPlayers: z.number().min(1, "Minimum players must be at least 1"),
  maxPlayers: z.number().min(1, "Maximum players must be at least 1"),
  ageRating: z.string().min(1, "Age rating is required"),
  website: z.string().url("Invalid URL").optional(),
  steamId: z.string().optional(),
});

type GameFormValues = z.infer<typeof gameSchema>;

interface AddGameFormProps {
  onGameAdded: (game: Game) => void;
}

export function AddGameForm({ onGameAdded }: AddGameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      isFree: false,
      isEarlyAccess: false,
      isMultiplayer: false,
      isSinglePlayer: true,
      isCoop: false,
      isOnline: false,
      isOffline: true,
      isCrossPlatform: false,
      isVR: false,
      minPlayers: 1,
      maxPlayers: 1,
      price: 0,
    },
  });

  const onSubmit = async (data: GameFormValues) => {
    try {
      setIsSubmitting(true);
      const gameData = {
        ...data,
        rating: 0,
        reviewCount: 0,
      };
      
      const newGame = await API.addGame(gameData);
      onGameAdded(newGame as unknown as Game);
      reset();
      toast.success("Game added successfully");
    } catch (error) {
      console.error("Failed to add game:", error);
      toast.error("Failed to add game");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <Input
          id="title"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          {...register("description")}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
          Cover Image URL
        </label>
        <Input
          id="coverImage"
          {...register("coverImage")}
          className={errors.coverImage ? "border-red-500" : ""}
        />
        {errors.coverImage && (
          <p className="text-red-500 text-sm mt-1">{errors.coverImage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="releaseDate" className="block text-sm font-medium mb-1">
          Release Date
        </label>
        <Input
          id="releaseDate"
          type="date"
          {...register("releaseDate")}
          className={errors.releaseDate ? "border-red-500" : ""}
        />
        {errors.releaseDate && (
          <p className="text-red-500 text-sm mt-1">{errors.releaseDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="developer" className="block text-sm font-medium mb-1">
          Developer
        </label>
        <Input
          id="developer"
          {...register("developer")}
          className={errors.developer ? "border-red-500" : ""}
        />
        {errors.developer && (
          <p className="text-red-500 text-sm mt-1">{errors.developer.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="publisher" className="block text-sm font-medium mb-1">
          Publisher
        </label>
        <Input
          id="publisher"
          {...register("publisher")}
          className={errors.publisher ? "border-red-500" : ""}
        />
        {errors.publisher && (
          <p className="text-red-500 text-sm mt-1">{errors.publisher.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price
        </label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          className={errors.price ? "border-red-500" : ""}
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minPlayers" className="block text-sm font-medium mb-1">
            Minimum Players
          </label>
          <Input
            id="minPlayers"
            type="number"
            {...register("minPlayers", { valueAsNumber: true })}
            className={errors.minPlayers ? "border-red-500" : ""}
          />
          {errors.minPlayers && (
            <p className="text-red-500 text-sm mt-1">{errors.minPlayers.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium mb-1">
            Maximum Players
          </label>
          <Input
            id="maxPlayers"
            type="number"
            {...register("maxPlayers", { valueAsNumber: true })}
            className={errors.maxPlayers ? "border-red-500" : ""}
          />
          {errors.maxPlayers && (
            <p className="text-red-500 text-sm mt-1">{errors.maxPlayers.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="ageRating" className="block text-sm font-medium mb-1">
          Age Rating
        </label>
        <Input
          id="ageRating"
          {...register("ageRating")}
          className={errors.ageRating ? "border-red-500" : ""}
        />
        {errors.ageRating && (
          <p className="text-red-500 text-sm mt-1">{errors.ageRating.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium mb-1">
          Website (optional)
        </label>
        <Input
          id="website"
          {...register("website")}
          className={errors.website ? "border-red-500" : ""}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="steamId" className="block text-sm font-medium mb-1">
          Steam ID (optional)
        </label>
        <Input
          id="steamId"
          {...register("steamId")}
          className={errors.steamId ? "border-red-500" : ""}
        />
        {errors.steamId && (
          <p className="text-red-500 text-sm mt-1">{errors.steamId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isFree")} />
            <span>Free to Play</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isEarlyAccess")} />
            <span>Early Access</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isMultiplayer")} />
            <span>Multiplayer</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isSinglePlayer")} />
            <span>Single Player</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isCoop")} />
            <span>Cooperative</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isOnline")} />
            <span>Online</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isOffline")} />
            <span>Offline</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isCrossPlatform")} />
            <span>Cross Platform</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isVR")} />
            <span>VR Support</span>
          </label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Game"}
      </Button>
    </form>
  );
}
