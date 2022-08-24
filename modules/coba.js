// import { downloadMediaMessage } from '@adiwajshing/baileys'
// import fs from 'fs/promises'
// import axios from 'axios'
// import { createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'
// import { writeFile } from 'fs'

// const ffmpeg = createFFmpeg({ log:true })

// const url = await fs.readFile('./medusa.png')

// // const url = "https://media.trace.moe/video/21034/%5BLeopard-Raws%5D%20Gochuumon%20wa%20Usagi%20Desu%20ka%202nd%20-%2001%20RAW%20(KBS%201280x720%20x264%20AAC).mp4?t=290.625&now=1658937600&token=RvH407IJAVRlJ6h6wb8Ln2rLWls"

// const getBuffer = async (url) => {
//     const res = await axios.get(url, {
//         responseType: 'arraybuffer'
//     })

//     // await fs.writeFile('./medusa.mp4', res.data)

//     const buffer = res.data
    
//     return buffer
// }

// // const buffer = await getBuffer(url)
// // console.log(buffer)
// const wait = async (media) => {
//     const pict = media
//     const info = await axios.post("https://api.trace.moe/search?cutBorders&anilistInfo", pict, {
//     headers: { "Content-type": "application/octet-stream" },
//     })
//     .catch((err) => console.log(err))

//     const data = info.data['result'][0]

//     const confidence = (data['similarity'] < 0.9) ? 'Saya memiliki keyakinan rendah akan hal ini:' : 'Mungkin ini yang anda cari:'
//     const ecchi = data['anilist']['isAdult'] ? 'Ya' : 'Tidak' 
//     const episode = data['episode'] ? data['episode'] : '-'
//     const similarity = Math.round(data['similarity'] * 100).toFixed(2)
//     const title = data['anilist']['title']['romaji']
//     const video = await getBuffer(data['video'])
//     const caption = `${confidence}\n-> *Judul* : ${title}\n-> *Episode* : ${episode}\n-> *Kecocokan* : ${similarity}%\n-> *Ecchi* : ${ecchi}`

//     await fs.writeFile('./medusa.mp4', video)
    
//     const conv = async () => {
//         await ffmpeg.load()
//         ffmpeg.FS('writeFile', 'medusa.mp4', await fetchFile('./medusa.mp4'))
//         await ffmpeg.run('-i', 'medusa.mp4', 'medusa1.mp4')
//         await fs.writeFile('./medusa1.mp4', ffmpeg.FS('readFile', 'medusa1.mp4'))
//         process.exit(0)
//     }

//     await conv()

//     return { video, caption }
// }

// wait(url)
