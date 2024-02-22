import { NextResponse } from "next/server";

export async function GET() {

    const tdl = require('tdl');

    const { getTdjson } = require('prebuilt-tdlib')
    tdl.configure({ tdjson: getTdjson() })


    const client = tdl.createClient({
        apiId: 29541512,
        apiHash: '0f045b2e98c2da89d4fd3d5f8ef472e8',
    });

//     client.on('error', console.error)

//   // Aside of receiving responses to your requests, the server can push to you
//   // events called "updates" which ar received as follows:
//   client.on('update', (update: any) => {
//     console.log('Got update:', update)
//   })

//   async function main () {
//     await client.login()
  
//     const me = await client.invoke({ _: 'getMe' })
//     console.log('My user:', me)
  
//     const chats = await client.invoke({
//       _: 'getChats',
//       chat_list: { _: 'chatListMain' },
//       limit: 10
//     })
//     console.log('A part of my chat list:', chats)
  
//     await client.invoke({
//       _: 'sendMessage',
//       chat_id: '6168849491',
//       input_message_content: {
//         _: 'inputMessageText',
//         text: {
//           _: 'formattedText',
//           text: '👻'
//         }
//       }
//     })
    
//     await client.close()
//   }
  
//   main().catch(console.error)
    return NextResponse.json({
        message: 'Received!',
    });
}