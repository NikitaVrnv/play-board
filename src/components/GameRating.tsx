import { Star } from "lucide-react"

interface GameRatingProps {
  rating: number
  className?: string
}

export function GameRating({ rating, className = "" }: GameRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating.toFixed(1)} / 5.0
      </span>
    </div>
  )
} 