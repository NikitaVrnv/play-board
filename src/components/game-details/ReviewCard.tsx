// src/components/game-details/ReviewCard.tsx
import { formatDistanceToNow } from "date-fns";
import { Review } from "@/types";
import { StarIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // Format date for display (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
  });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(review.username || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.username || "Anonymous"}</div>
              <div className="text-sm text-muted-foreground">{formattedDate}</div>
            </div>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted/20 text-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90">{review.comment}</p>
      </CardContent>
    </Card>
  );
}