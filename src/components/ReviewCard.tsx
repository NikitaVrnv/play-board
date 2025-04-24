import { Review } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameRating } from "@/components/GameRating";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{review.username}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.userAvatar} />
            <AvatarFallback>{review.username[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{review.username}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < review.rating ? "text-yellow-500" : "text-muted"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {review.isVerifiedOwner && (
                    <Badge variant="secondary">Verified Owner</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <GameRating rating={review.rating} />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-foreground/90">{review.content}</p>
      </CardContent>
    </Card>
  );
}
