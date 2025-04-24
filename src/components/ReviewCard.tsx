
import { Review } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="border border-muted rounded-lg p-4 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={review.userAvatar} alt={review.username} />
          <AvatarFallback>{review.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h4 className="font-semibold">{review.username}</h4>
            <div className="flex items-center gap-1 mt-1 sm:mt-0">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted/20 text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
