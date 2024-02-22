"use client"

import { Song } from "@/types";
import MediaItem from "../../../components/MediaItem";
import LikeButton from "../../../components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";

interface SearchContentProps {
    songs: Song[];
}

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs);
    if(songs.length === 0) {
        return (
            <div className="px-6 text-neutral-400 text-sm w-full">
                No songs found.
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full px-6 gap-y-2">
            {
                songs.map((song) => (
                    <div
                        key={song.id}
                        className="flex items-center gap-x-4 w-full"
                    >
                        <div className="flex-1">
                            <MediaItem
                                onClick={(id: string) => onPlay(id)}
                                song={song}
                            />
                        </div>
                        <LikeButton songId={song.id} />
                    </div>
                ))
            }
        </div>
    )
}
 
export default SearchContent;