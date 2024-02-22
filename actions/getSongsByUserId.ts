import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";

const getSongsByUserId = async (): Promise<Song[]> => {
    const supabaseClient = createServerComponentClient({
        cookies: cookies
    });
    
    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if(sessionError) {
        console.log(sessionError.message);
        return [];
    }

    const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .eq('user_id', sessionData?.session?.user.id)
        .order('created_at', { ascending: false});
    
    return ( data as any || [] );
}

export default getSongsByUserId;