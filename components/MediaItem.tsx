"use client"

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

interface MediaItemProps {
    song: Song;
    onClick?: (id: string) => void;
    inactive?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({ song, onClick, inactive }) => {
    const imageUrl = useLoadImage(song);

    const handleClick = () => {
        if(onClick) {
            return onClick(song.id);
        }
    }

    return (
        <div 
            onClick={handleClick}
            className={twMerge(` 
                flex
                items-center
                gap-x-3
                p-2
                
                rounded-md
                cursor-pointer
                truncate
        `, inactive ? "": 'hover:bg-neutral-800/50')}>
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