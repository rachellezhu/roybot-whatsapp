const fs = require("fs");
const { removeBackgroundFromImageBase64 } = require("remove.bg");
const { processMediaSync } = require("./functions.js");

exports.toSticker = async (buffer, author) => {
    const ext = "webp";
    const sticker1Path = `./temp/sticker.${ext}`;
    await fs.promises.writeFile(sticker1Path, buffer);
    const sticker2Path = `./temp/sticker2.${ext}`;

    const sticker = await processMediaSync(
        sticker1Path,
        sticker2Path,
        ext,
        author
    );

    if (sticker) {
        return sticker2Path;
    }
};

exports.toNoBgSticker = async (buffer, author) => {
    const base64img = buffer.toString("base64");
    const result = await removeBackgroundFromImageBase64({
        base64img,
        apiKey: "--- Put Your API Key Here ---",
    }).catch((error) => {
        console.log(JSON.stringify(error));
    });

    const toBuffer = Buffer.from(result.base64img, "base64");
    const sticker = await this.toSticker(toBuffer, author);
    const stickerPath = "./temp/sticker2.webp";

    if (sticker) return stickerPath;
};
