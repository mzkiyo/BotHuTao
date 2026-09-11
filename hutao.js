import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { Boom, boomify, isBoom } from "@hapi/boom";
import NodeCache from "node-cache";
import { join } from "node:path";
import pino from "pino";
import chalk from "chalk";
import { exec } from "child_process";

import "dotenv/config";

import handler from "./handler.js";
import { config } from "./config/config.js";

const msgCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const logger = pino({ level: "fatal" });
const { state, saveCreds } = await useMultiFileAuthState(
  join(process.cwd(), config.bot.sessionFolder || "auth")
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
    generateHighQualityLinkPreview: true
  });

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "connecting") {
      print(chalk.blue("[CONNECTION]: ") + "connecting...");
      if (!sock.authState.creds.registered) {
        print("Generating pairing code...");
        setTimeout (async() => {
          try {
            print("target: " + config.bot.number)
        const code = await sock.requestPairingCode(
          config.bot.number,
          config.bot.pairingCode
        );
        print(chalk.bold.yellow("[!]") + "🔗 Pairing code:", code);
          } catch(e) {
            print(chalk.red("[PAIRING FAILED]: ") + "Gagal mendapatkan pairing code. Error: " + e.message);
            process.exit(1)
          }
        }, 3000)
      }
    } else if (connection === "close") {
      const error = lastDisconnect?.error;
      const statusCode = isBoom(error) ? error.output.statusCode : undefined;

      print(chalk.red("[CONNECTION CLOSED]: ") + "status: " + statusCode);

      if (statusCode === DisconnectReason.loggedOut) {
        print("❌ Koneksi terputus");
        if (config.settings.autoDeleteSessionFolder) {
          print(
            "🗑️ Deleting session folder... \n(you can set auto delete or manual delete on ./config/config.json)"
          );
          exec(
            "rm -rf " + config.bot.sessionFolder,
            (error, stdout, stderr) => {
              if (error) {
                print(
                  chalk.red("[SESSION DELETE ERROR]: ") +
                    error.message.toString()
                );
                return;
              }
              print("Session deleted. Reconnecting...");
              start();
            }
          );
        } else {
          print(
            chalk.bold.yellow(">> ") + "Hapus folder session dan coba lagi"
          );
        }
      } else if (statusCode === DisconnectReason.restartRequired) {
        print(chalk.bold.yellow("[!] ") + "Restart required. Restarting...");
        start();
      } else if (
        statusCode === DisconnectReason.connectionLost ||
        statusCode === DisconnectReason.timedOut
      ) {
        print(
          chalk.bold.yellow("[!] ") +
            "Koneksi hilang/Timed out. Mencoba menghubungkan kembali..."
        );
        start();
      } else if (statusCode === DisconnectReason.badSession) {
        print("Bad session. Session corrupt");
        if (config.settings.autoDeleteSessionFolder) {
          print(
            "🗑️ Menghapus folder session secara otomatis...\n(you can set auto deletebor manual delete in ./config/config.json"
          );
          exec("rm -rf " + config.bot.sessionFolder, (err, out, stderr) => {
            if (err) {
              print(
                chalk.red(">> ") +
                  "Error saat menghapus folder session " +
                  error?.message.toString()
              );
              return;
            }
            print("berhasil menghapus folder session. Restarting...");
            start();
          });
        } else {
          print(
            "Folder session rusak/corrupt. Hapus folder session dan coba lagi"
          );
        }
      }
    } else if (connection === "open") {
      print(chalk.green("[CONNECTED]: ") + "✅ Bot berhasil tersambung");
      sock.sendMessage(`${config.owner.number}@s.whatsapp.net`, {
        text: `${config.bot.name} Aktif! Siap menerima perintah`
      });
    } else {
      print(
        chalk.yellow("[CONNECTION]: ") +
          "Koneksi tidak terdeteksi. Silahkan mulai ulang"
      );
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    await handler(m, sock);
  });
}

await start();
