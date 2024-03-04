import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    
    const coverData = await axios.get(url, { responseType: 'stream' });
    coverData.data.pipe(require('fs').createWriteStream('./extra_data/covers/hello.png'));
    coverData.data.on('end', () => {
        console.log('Image downloaded successfully.');
    });
    return NextResponse.json({ msg: 'OK' });;
}