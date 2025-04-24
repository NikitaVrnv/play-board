
interface GameCoverProps {
  coverImage: string;
  title: string;
}

const GameCover = ({ coverImage, title }: GameCoverProps) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-6 bg-muted">
      <img
        src={coverImage}
        alt={title}
        className="object-cover w-full h-full"
      />
    </div>
  );
};

export default GameCover;
