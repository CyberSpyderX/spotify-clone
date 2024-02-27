
import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import PlayButton from "./PlayButton";

interface SongItemProps {
    song: Song;
    onClick: (id: string) => void;
}
const SongItem: React.FC<SongItemProps> = ({ song, onClick }) => {
    const imagePath = useLoadImage(song)

    return (
        <div
            onClick={() => onClick(song.id)} 
            className="
                relative
                bg-neutral-400/5
                hover:bg-neutral-400/10
                rounded-md
                overflow-hidden
                p-3
                flex
                group
                items-center
                justify-center
                transition
                flex-col
                cursor-pointer
        ">
            <div className="
                relative
                aspect-square
                w-full
                h-full
                rounded-md
                overflow-hidden
            ">
                <Image 
                    className="object-cover"
                    src={ imagePath || '/images/liked.png'}
                    fill
                    alt={song.title}
                />
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                <p className="font-semibold truncate text-md w-full">
                    {song.title}
                </p>
                <p className="text-sm truncate text-neutral-400 pb-4 w-full">
                    {song.artists}
                </p>
            </div>
            <div className="
                absolute
                bottom-24
                right-5
            ">
                <PlayButton />
            </div>
        </div>
    );
}
 
export default SongItem;