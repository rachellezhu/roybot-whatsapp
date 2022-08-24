const axios = require("axios");
const { execSync } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

exports.getBuffer = async (url) => {
    const res = await axios.get(url, {
        responseType: "arraybuffer",
    });
    const buffer = res.data;
    return buffer;
};

exports.processMediaSync = (input, output, ext, author = null) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (err) console.log(err);
            else {
                var options = [];
                if (ext === "webp") {
                    var height = metadata.streams[0].height;
                    var width = metadata.streams[0].width;
                    var scale =
                        height == 512 && width == 512
                            ? 1
                            : height > width
                            ? height / 512
                            : width > height
                            ? width / 512
                            : width / 512;

                    height = height / scale;
                    width = width / scale;
                    options = [
                        `-vcodec`,
                        `libwebp`,
                        `-vf`,
                        `scale='${width}':'${height}':force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
                    ];
                }
                ffmpeg(input)
                    .addOutputOptions(options)
                    .toFormat(ext)
                    .save(output)
                    .on("end", async () => {
                        if (ext === "webp") {
                            execSync(
                                `webpmux -set exif ${addMetadata(
                                    author
                                )} ${output} -o ${output}`,
                                async (err) => {
                                    if (err)
                                        console.log(
                                            "--- failed to add metadata"
                                        );
                                }
                            );
                        }
                        console.log("Media rendered");
                        resolve(true);
                    })
                    .on("err", (error) => {
                        return reject(error);
                    });
            }
        });
    });
};

const addMetadata = (author) => {
    const ext = "exif";
    const data = {
        "sticker-pack-name": `${author}'s pack`,
        "sticker-pack-publisher": author,
    };
    const littleEndian = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00,
    ]);
    const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];
    let len = JSON.stringify(data).length;
    let last;

    if (len > 256) {
        len = len - 256;
        bytes.unshift(0x01);
    } else {
        bytes.unshift(0x00);
    }

    if (len < 16) {
        last = len.toString(16);
        last = "0" + len;
    } else {
        last = len.toString(16);
    }

    const buff1 = Buffer.from(last, "hex");
    const buff2 = Buffer.from(bytes);
    const buff3 = Buffer.from(JSON.stringify(data));
    const buffer = Buffer.concat([littleEndian, buff1, buff2, buff3]);

    fs.writeFileSync(`./temp/sticker2.${ext}`, buffer);

    return `./temp/sticker2.${ext}`;
};
