const {
    default: socket,
    DisconnectReason,
    downloadMediaMessage,
    useMultiFileAuthState,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const { toSticker, toNoBgSticker } = require("./modules/sticker.js");
const { wait } = require("./modules/anime.js");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./utils/settings.json"));
var prefix = settings.prefix;
var owner = settings.ownerNumber;

const makeWASocket = socket;

const connectToWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
        "auth_info_baileys"
    );
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                new Boom(lastDisconnect?.error)?.output?.statusCode !==
                DisconnectReason.loggedOut;
            console.log(
                "Connection close due to ",
                lastDisconnect.error,
                " reconnecting",
                shouldReconnect
            );

            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log("Opened connection");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const m = messages[0];
            const message = m.message;
            const quotedMedia = JSON.stringify(message);
            const senderNo = m.key.remoteJid;
            const no = senderNo.split("@")[0];
            const senderName = m.pushName;
            if (!message) return;

            const messageType = Object.keys(message)[0];
            const messageData = message[messageType];
            const isQuotedImage =
                messageType === "extendedTextMessage" &&
                quotedMedia.includes("imageMessage");
            const isQuotedSticker =
                messageType === "extendedTextMessage" &&
                quotedMedia.includes("stickerMessage");
            const isQuotedVideo =
                messageType === "extendedTextMessage" &&
                quotedMedia.includes("videoMessage");

            var text =
                messageType === "conversation" &&
                message.conversation.startsWith(prefix)
                    ? message.conversation
                    : messageType === "imageMessage" &&
                      message.imageMessage.caption.startsWith(prefix)
                    ? message.imageMessage.caption
                    : messageType === "videoMessage" &&
                      message.videoMessage.caption.startsWith(prefix)
                    ? message.videoMessage.caption
                    : messageType === "extendedTextMessage" &&
                      message.extendedTextMessage.text.startsWith(prefix)
                    ? message.extendedTextMessage.text
                    : "";

            const buffer = async (media) => {
                const buffer = await downloadMediaMessage(
                    media,
                    "buffer",
                    {},
                    { reuploadRequest: sock.updateMediaMessage }
                );

                return buffer;
            };

            const command = text
                .slice(1)
                .trim()
                .split(/ +/)
                .shift()
                .toLowerCase();
            const args = text.trim().split(/ +/).slice(1);

            const reaction = (emoji) => {
                return {
                    react: {
                        text: emoji,
                        key: m.key,
                    },
                };
            };

            switch (command) {
                case "help":
                case "menu":
                    console.log(`- .help/.menu from ${no}`);
                    sock.sendMessage(
                        senderNo,
                        {
                            text: "Saat ini bot hanya menyediakan 2 fitur saja, mungkin nanti akan diperbarui:\n\n- .stiker atau .sticker untuk membuat stiker dari gambar/video/animasi gif\n- .wait untuk mencari anime dari gambar\n\nMohon maaf atas kekurangannya",
                        },
                        { quoted: m }
                    );
                    break;
                case "sticker":
                case "stiker":
                    if (
                        (messageType === "imageMessage" || isQuotedImage) &&
                        args.length == 0
                    ) {
                        console.log(
                            `- .sticker/.stiker from ${no}, an image received`
                        );
                        const getPict = isQuotedImage
                            ? JSON.parse(
                                  JSON.stringify(m).replace(
                                      "quotedMessage",
                                      "message"
                                  )
                              ).message.extendedTextMessage.contextInfo
                            : m;
                        const pict = await buffer(getPict);

                        console.log(
                            `--- an image from ${no} is being processed`
                        );

                        await toSticker(pict, senderName)
                            .then(async (data) => {
                                const sticker = await fs.promises.readFile(
                                    data
                                );
                                sock.sendMessage(senderNo, reaction("👍"));
                                sock.sendMessage(
                                    senderNo,
                                    { sticker },
                                    { quoted: m }
                                );
                                console.log(
                                    `--- an image from ${no} has been successfully processed`
                                );
                            })
                            .catch((error) =>
                                console.log(
                                    "--- image failed to process: ",
                                    error
                                )
                            );
                    } else if (
                        (messageType === "videoMessage" || isQuotedVideo) &&
                        args.length == 0
                    ) {
                        console.log(
                            `- .sticker/.stiker from ${no}, a video/gif received`
                        );
                        const getVid = isQuotedVideo
                            ? JSON.parse(
                                  JSON.stringify(m).replace(
                                      "quotedMessage",
                                      "message"
                                  )
                              ).message.extendedTextMessage.contextInfo
                            : m;
                        const vid = await buffer(getVid);

                        console.log(
                            `--- a video/gif from ${no} is being processed`
                        );

                        await toSticker(vid, senderName)
                            .then(async (data) => {
                                const sticker = await fs.promises.readFile(
                                    data
                                );
                                sock.sendMessage(senderNo, reaction("👍"));
                                sock.sendMessage(
                                    senderNo,
                                    { sticker },
                                    { quoted: m }
                                );
                                console.log(
                                    `--- a video from ${no} has been successfully processed`
                                );
                            })
                            .catch((error) =>
                                console.log(
                                    "--- video failed to process: ",
                                    error
                                )
                            );
                    } else if (
                        (messageType === "imageMessage" || isQuotedImage) &&
                        args[0] == "nobg"
                    ) {
                        console.log(
                            `- .sticker/.stiker nobg from ${no}, an image received`
                        );
                        const getPict = isQuotedImage
                            ? JSON.parse(
                                  JSON.stringify(m).replace(
                                      "quotedMessage",
                                      "message"
                                  )
                              ).message.extendedTextMessage.contextInfo
                            : m;
                        const pict = await buffer(getPict);

                        console.log(
                            `--- an image from ${no} is being processed`
                        );

                        await toNoBgSticker(pict, senderName)
                            .then(async (data) => {
                                console.log(data);
                                const sticker = await fs.promises.readFile(
                                    data
                                );
                                sock.sendMessage(senderNo, reaction("👍"));
                                sock.sendMessage(
                                    senderNo,
                                    { sticker },
                                    { quoted: m }
                                );
                                console.log(
                                    `--- an image from ${no} has been successfully processed`
                                );
                            })
                            .catch((error) =>
                                console.log(
                                    "--- image failed to process: ",
                                    error
                                )
                            );
                    } else {
                        console.log(
                            `- .sticker/.stiker from ${no}, no media received`
                        );
                        await sock.sendMessage(senderNo, reaction("😢"));
                        await sock.sendMessage(
                            senderNo,
                            { text: "*Gambar/Video/Animasinya mana, kak?*" },
                            { quoted: m }
                        );
                    }

                    break;
                case "wait":
                    if (
                        messageType === "imageMessage" ||
                        (isQuotedImage && args.length == 0)
                    ) {
                        console.log(`- .wait from ${no}, an image received`);
                        const getPict = isQuotedImage
                            ? JSON.parse(
                                  JSON.stringify(m).replace(
                                      "quotedMessage",
                                      "message"
                                  )
                              ).message.extendedTextMessage.contextInfo
                            : m;
                        const pict = await buffer(getPict);

                        sock.sendMessage(
                            senderNo,
                            { text: "_gambar sedang diproses..._" },
                            { quoted: m }
                        );

                        console.log(
                            `--- an image from ${no} is being processed`
                        );

                        await wait(pict)
                            .then(async (data) => {
                                const video = await fs.promises.readFile(
                                    data["video2"]
                                );
                                sock.sendMessage(senderNo, reaction("🥵"));
                                sock.sendMessage(
                                    senderNo,
                                    { video, caption: data["caption"] },
                                    { quoted: m }
                                );
                                console.log(
                                    `--- an image from ${no} has been successfully processed`
                                );
                            })
                            .catch((error) => {
                                console.log(
                                    "--- image failed to process: ",
                                    error
                                );
                                sock.sendMessage(
                                    senderNo,
                                    {
                                        text: "Maaf, saya tidak tahu anime apa ini",
                                    },
                                    { quoted: m }
                                );
                            });
                    } else {
                        console.log(`- .wait from ${no}, no image received`);
                        await sock.sendMessage(senderNo, reaction("😢"));
                        await sock.sendMessage(
                            senderNo,
                            { text: "*Gambarnya mana, kak?*" },
                            { quoted: m }
                        );
                    }
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    });
};

connectToWhatsApp();
