"use client"

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";

interface MediaItemProps {
    song: Song;
    onClick?: (id: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ song, onClick }) => {
    const imageUrl = useLoadImage(song);

    const handleClick = () => {
        if(onClick) {
            return onClick(song.id);
        }
    }

    return (
        <div 
        onClick={handleClick}
        className="
            flex
            items-center
            gap-x-3
            p-2
            hover:bg-neutral-800/50
            rounded-md
            cursor-pointer
            truncate
        ">
        <div className="
            relative
            rounded-md
            min-h-[48px]
            min-w-[48px]
            overflow-hidden
        ">
            <Image 
                src={imageUrl || "/images/liked.png"}
                fill
                alt="Song Cover"
                className="object-cover"
            />
        </div>
        <div className="flex flex-col overflow-hidden">
            <p className="text-white truncate">
                {song.title}
            </p>
            <p className="text-sm truncate text-neutral-400">
                {song.artists}
            </p>
        </div>
        </div>
    );
}
 
export default MediaItem;