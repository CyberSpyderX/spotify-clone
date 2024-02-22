import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";

const getLikedSongs = async (): Promise<Song[]> => {
    const supabaseClient = createServerComponentClient({
        cookies: cookies
    });

    const { data: { session }} = await supabaseClient.auth.getSession();

    const { data, error } = await supabaseClient
        .from('liked_songs')
        .select('*, songs(*)')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

    if(error) {
        console.log(error);
        return [];
    }
    
    return data.map((item) => ({
        ...item.songs
    }))
}

export default getLikedSongs;