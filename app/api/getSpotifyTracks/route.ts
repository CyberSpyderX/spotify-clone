import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

let spotifyToken: any = null;

export async function GET (req: NextRequest) {
    if(!spotifyToken) {
        console.log('Running...');
        
        spotifyToken = await axios.post('https://accounts.spotify.com/api/token', {
            'grant_type': 'client_credentials',
            'client_id': '51774a03f0944a26a2d68d2680c899f8',
            'client_secret': '807ec120762142419e7a6d439af457c9',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then( resp => resp.data.access_token)
    }

    console.log(spotifyToken);
    
    const trackName = req.nextUrl.searchParams.get('track');

    const tracks = await axios.get('https://api.spotify.com/v1/search', {
        params: {
            q: trackName,
            type: 'track',
            limit: 5,
        },
        headers: {
            'Authorization': `Bearer ${spotifyToken}`,
        }
    });
    
    const response = tracks.data.tracks.items.map(track => {
        return {
            title: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            imageUrl: track.album?.images[0].url
        }
    });

    
    return NextResponse.json({tracks: response});
}
