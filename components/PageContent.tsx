"use client"

import { Song } from "@/types";
import SongItem from "./SongItem";
import useOnPlay from "@/hooks/useOnPlay";

interface PageContentProps {
    songs: Song[]
}

const PageContent: React.FC<PageContentProps> = ({songs}) => {

    const onPlay = useOnPlay(songs);
    if(songs.length === 0) {
        return (
            <div className="text-sm text-neutral-400 mt-4">
                No songs available
            </div>
        )
    }

    return (
        <div className="
            grid
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-8
            gap-4
            mt-4
        ">
            {
                songs.map(song => (
                    <SongItem 
                        key={song.id}
                        song={song}
                        onClick={(id: string) => onPlay(id)}
                    />
                ))
            }
        </div>
    );
}
 
export default PageContent;