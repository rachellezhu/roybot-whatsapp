const axios = require("axios");
const { getBuffer, processMediaSync } = require("./functions.js");
const fs = require("fs");

exports.wait = async (media) => {
    const ext = "mp4";
    const video1 = "./temp/anime.mp4";
    if (fs.existsSync(video1)) await fs.promises.unlink(video1);
    const pict = media;
    const info = await axios
        .post("https://api.trace.moe/search?cutBorders&anilistInfo", pict, {
            headers: { "Content-type": "application/octet-stream" },
        })
        .catch((err) => console.log(err));

    const data = info.data["result"][0];

    const confidence =
        data["similarity"] < 0.9
            ? "Saya memiliki keyakinan rendah akan hal ini:"
            : "Mungkin ini yang anda cari:";
    const ecchi = data["anilist"]["isAdult"] ? "Ya" : "Tidak";
    const episode = data["episode"] ? data["episode"] : "-";
    const similarity = Math.round(data["similarity"] * 100).toFixed(2);
    const title = data["anilist"]["title"]["romaji"];
    const video = await getBuffer(data["video"]);
    const caption = `${confidence}\n-> *Judul* : ${title}\n-> *Episode* : ${episode}\n-> *Kecocokan* : ${similarity}%\n-> *Ecchi* : ${ecchi}`;

    await fs.promises.writeFile(video1, video);
    const video2 = `./temp/anime2.${ext}`;

    const vid = await processMediaSync(video1, video2, ext);

    if (vid) {
        return { caption, video2 };
    }
};
