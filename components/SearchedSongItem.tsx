"use client"

import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export interface SearchedSong {
    imageUrl: string;
    title: string;
    artists: string;
}
export interface SearchedSongItemProps {
    song: SearchedSong;
    isSelected: boolean;
    onClick?: (id: string) => void;
}

const SearchedSongItem: React.FC<SearchedSongItemProps> = ({ song, isSelected, onClick }) => {

    return (
        <div
        onClick={onClick}
        className={twMerge(`
            flex
            items-center
            gap-x-3
            p-2
            rounded-md
            cursor-pointer
            overflow-hidden
        `, isSelected ? 'bg-customGreen' : 'hover:bg-neutral-700/50')}>
        <div className="
            relative
            rounded-md
            min-h-[48px]
            min-w-[48px]
            overflow-hidden
        ">
            <Image 
                src={song.imageUrl || "/images/liked.png"}
                fill
                alt="Song Cover"
                className="object-cover"
            />
        </div>
        <div className="flex flex-col overflow-hidden">
            <p className={twMerge('truncate', isSelected ? 'text-black font-semibold' : 'text-white')}>
                {song.title}
            </p>
            <p className={twMerge("text-sm truncate", isSelected ? 'text-black' : '')}>
                {song.artists}
            </p>
        </div>
        </div>
    );
}
 
export default SearchedSongItem;