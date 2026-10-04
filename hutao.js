import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "@whiskeysockets/baileys";
import { isBoom } from "@hapi/boom";
//import NodeCache from "node-cache";
import { rmSync } from "node:fs";
import { join } from "node:path";
import pino from "pino";
import chalk from "chalk";
import { Worker } from "node:worker_threads";

import "dotenv/config";

import handler from "./handler/index.js";
import { config } from "./config/config.js";
import { clog } from "./lib/helper.js";

const handlerPath = join(process.cwd(), "handler", "index.js");
// const handler = new Worker(handlerPath);
//const msgCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const logger = pino({ level: "fatal" });
const { state, saveCreds } = await useMultiFileAuthState(
  join(process.cwd(), config.bot.sessionFolder || "auth"),
);
const print = console.log;

async function start() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: logger,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    browser: Browsers.ubuntu("Chrome"),
    maxMsgRetryCount: 5,
    enableRecentMessageCache: true,
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "connecting") {
      print(chalk.blue("[CONNECTION]: ") + "connecting...");
      if (!sock.authState.creds.registered) {
        print("Generating pairing code...");
        setTimeout(async () => {
          try {
            print("target: " + config.bot.number);
            const code = await sock.requestPairingCode(
              config.bot.number,
              config.bot.pairingCode,
            );
            print(chalk.bold.yellow("[!]") + "🔗 Pairing code:", code);
          } catch (err) {
            const e = /** @type {Error} */ (err);
            print(
              chalk.red("[PAIRING FAILED]: ") +
                "Gagal mendapatkan pairing code. Error: " +
                e.message,
            );
            process.exit(1);
          }
        }, 3000);
      }
    } else if (connection === "close") {
      const error = lastDisconnect?.error;
      const statusCode = isBoom(error) ? error.output.statusCode : undefined;

      print(chalk.red("[CONNECTION CLOSED]: ") + "status: " + statusCode);

      if (statusCode === DisconnectReason.loggedOut) {
        print("❌ Koneksi terputus");
        if (config.bot.autoDeleteSessionFolder) {
          print(
            "🗑️ Deleting session folder... \n(you can set auto delete or manual delete on ./config/config.js)",
          );
          rmSync(join(process.cwd(), config.bot.sessionFolder), {
            recursive: true,
            force: true,
          });
          print(">> Done Deleting Session Folder");
          print(">> Restarting...");
          await start();
        } else {
          print(
            chalk.bold.yellow(">> ") + "Hapus folder session dan coba lagi",
          );
        }
      } else if (statusCode === DisconnectReason.restartRequired) {
        print(chalk.bold.yellow("[!] ") + "Restart required. Restarting...");
        await start();
      } else if (
        statusCode === DisconnectReason.connectionLost ||
        statusCode === DisconnectReason.timedOut
      ) {
        print(
          chalk.bold.yellow("[!] ") +
            "Koneksi hilang/Timed out. Mencoba menghubungkan kembali...",
        );
        await start();
      } else if (statusCode === DisconnectReason.badSession) {
        print("Bad session. Session corrupt");
        if (config.bot.autoDeleteSessionFolder) {
          print(
            "🗑️ Menghapus folder session secara otomatis...\n(you can set auto deletebor manual delete in ./config/config.json",
          );
          rmSync(join(process.cwd(), config.bot.sessionFolder), {
            recursive: true,
            force: true,
          });
          print(">> Done Deleting Session Folder");
          print(">> Restarting...");
          await start();
        } else {
          print(
            "Folder session rusak/corrupt. Hapus folder session dan coba lagi",
          );
        }
      }
    } else if (connection === "open") {
      print(chalk.green("[CONNECTED]: ") + "✅ Bot berhasil tersambung");
      // sock.sendMessage(`${config.owner.number}@s.whatsapp.net`, {
      //   text: `${config.bot.name} Aktif! Siap menerima perintah`,
      // });
    } else {
      print(
        chalk.yellow("[CONNECTION]: ") +
          "Koneksi tidak terdeteksi. Silahkan mulai ulang",
      );
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = /** @type {User} */ (messages[0]);
    if (!m.message) return;
    await handler(m, sock);
  });
}

await start();
