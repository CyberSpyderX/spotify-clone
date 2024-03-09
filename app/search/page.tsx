import getSongsByTitle from "@/actions/getSongsByTitle";

import Header from "@/components/Header";
import SearchContent from "@/app/search/components/SearchContent";
import SearchInput from "@/components/SearchInput";
import useOnPlay from "@/hooks/useOnPlay";
var a = require('../../extra_data/music/test.mp3')

export const revalidate = 0;

interface SearchProps {
    searchParams: {
        title: string;
    }
}

const Search = async ({ searchParams }: SearchProps) => {
    const songs = await getSongsByTitle(searchParams.title);

    return (
        <div className="
            bg-neutral-900
            w-full
            h-full
            rounded-md
            overflow-hidden
            overflow-y-scroll
        ">
            <audio >

            </audio>
            <Header className="from-bg-neutral-900">
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">
                        Search
                    </h1>
                    <SearchInput />
                </div>
            </Header>
            <SearchContent songs={songs} />
        </div>
    );
}

export default Search;