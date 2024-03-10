import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import uniqid from "uniqid";
const tdl = require('tdl');
const { getTdjson } = require('prebuilt-tdlib')
tdl.configure({ tdjson: getTdjson() });
import { cookies } from "next/headers";
import axios from "axios";

export async function GET(req: NextRequest) {
    let finalMessage, status, finalResponse;
    await new Promise(async (resolve, reject) => {
        const userId = req.nextUrl.searchParams.get('userId');
        const songName = req.nextUrl.searchParams.get('name')?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z\s,-]/g, '');
        const imageUrl = req.nextUrl.searchParams.get('coverPath');

        let result = '';
        const client = tdl.createClient({
            apiId: 29541512,
            apiHash: '0f045b2e98c2da89d4fd3d5f8ef472e8',
            filesDirectory: 'C:/Users/gupta/OneDrive/Documents/Full Stack Projects/spotify-clone/extra_data'
        });

        const supabaseClient = createServerComponentClient({ cookies });

        console.log('Created clients...');
        await client.login();
        console.log('Logged in!');

        await client.invoke({
            _: 'sendMessage',
            chat_id: '6168849491',
            input_message_content: {
            _: 'inputMessageText',
            text: {
                _: 'formattedText',
                text: songName,
            }
            }
        });
        console.log('Message sent...');

        setTimeout(() => {
            console.log('Client closed....');

            client.close()
        }, 7000);

        client.on('update', async update => {
            let songFileId = -1, coverFileId = -1;

            if(update['_'] === 'updateNewMessage' && update.message.chat_id === 6168849491) {
                if(update.message.content._ === 'messageAudio') {
                    console.log('Audio message received...');

                    songFileId = update.message.content.audio.audio.id;
                    coverFileId = update.message.content.audio.external_album_covers[1].file.id;
                    console.log(songFileId);

                    await client.invoke({
                        _: 'downloadFile',
                        file_id: songFileId,
                        priority: 32,
                    });

                    client.on('update', async update => {
                        if(update._ === 'updateFile' 
                        && update.file.id === songFileId
                        && update.file.local.is_downloading_completed) {
                            console.log('Song download completed...');

                            const path = update.file.local.path;
                            const fileBuffer = require('fs').createReadStream(path);

                            console.log(songName?.substring(songName.indexOf('- ') + 2));
                            const uniqueId = uniqid();
                            const coverFileName = `covers-${songName}-${uniqueId}`;
                            const { 
                                data: songData,
                                error: songError,
                            } = await supabaseClient
                                .storage
                                .from('songs')
                                .upload(`songs-${songName}-${uniqueId}`, fileBuffer, {
                                    cacheControl: '3600',
                                    upsert: false,
                                    contentType: 'audio/mpeg',
                                    duplex: 'half'
                                })

                            if(songError) {
                                finalResponse = NextResponse.json({ error: "Couldn't upload song..." }, { status: 404 });
                                return;
                            }
                            console.log(songData, songError);

                            console.log('Image URL: ', imageUrl);

                            const coverData = await axios.get(imageUrl, { responseType: 'stream' });
                            coverData.data.pipe(require('fs').createWriteStream(`./extra_data/${songName}.jpeg`));
                            coverData.data.on('end', async () => {
                                const { data, error } = await supabaseClient.storage.from('covers').upload(
                                    coverFileName, require('fs').createReadStream(`./extra_data/${songName}.jpeg`), {
                                        cacheControl: '3600',
                                        contentType: 'image/jpeg',
                                        upsert: false,
                                        duplex: 'half'
                                    })

                                const artists = songName?.substring(0, songName.indexOf(' - '));
                                const title = songName?.substring(songName.indexOf('- ') + 2);

                                if(error) {
                                    finalResponse = NextResponse.json({ error: "Couldn't upload song..." }, { status: 404 });
                                    return;
                                }
                                console.log(data, error);

                                const { error: SQLError } = await supabaseClient
                                .from('songs')
                                .insert({
                                    user_id: userId,
                                    title: title,
                                    artists: artists,
                                    song_path: songData?.path,
                                    cover_path: data?.path,
                                });
                                if(SQLError) {
                                    finalResponse = NextResponse.json({ error: "Couldn't upload song..." }, { status: 404 });
                                    return;
                                }
                                console.log('Song uploaded...');

                                resolve('heloooooooooooooooo');
                                finalResponse = NextResponse.json({ message: 'Song uploaded...'}, { status: 200 });
                            });
                            }
                    })
                }
            }
        });

    }).then((result) => {
        finalMessage = { message: "Song added successfully!" };
        status = 200;
    }).catch(error => {
        finalMessage = "Couldn't add the song";
        status = 404;
    });

    return NextResponse.json(finalMessage, {status});
}