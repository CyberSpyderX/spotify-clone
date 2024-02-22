import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";

const getSongs = async (): Promise<Song[]> => {
    const supabaseClient = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

    if(error) {
        console.log(error);
    }

    return (data as any) || [];
}

export default getSongs;