interface GameCoverProps {
  coverImage: string;
  title: string;
}

const GameCover = ({ coverImage, title }: GameCoverProps) => {
  return (
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-6">
      <img
        src={coverImage}
        alt={title}
        className="object-cover w-full h-full"
      />
    </div>
  );
};

export default GameCover;
