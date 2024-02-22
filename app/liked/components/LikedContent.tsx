"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useUser } from "@/hooks/useUser";
import useOnPlay from "@/hooks/useOnPlay";

import { Song } from "@/types";
import LikeButton from "@/components/LikeButton";
import MediaItem from "@/components/MediaItem";

interface LikedContentProps {
    songs: Song[];
}

const LikedContent: React.FC<LikedContentProps> = ({ songs }) => {
    const router = useRouter();
    const { isLoading, user} = useUser();
    const onPlay = useOnPlay(songs);

    useEffect(() => {
        if(!isLoading && !user) {
            router.replace('/');
        }
    }, [isLoading, user, router]);

    if(songs.length === 0) {
        return (
            <div className="
                text-neutral-400
                px-6
                w-full
            ">
                No liked songs.
            </div>
        );
    }

    return (
        <div>
            {
                songs.map((song) => (
                    <div
                        key={song.id}
                        className="
                            flex
                            items-center
                            px-6
                            gap-x-4
                            w-full
                        "
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
    );
}
 
export default LikedContent;