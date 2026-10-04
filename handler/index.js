import { userdb } from "../lib/database.js";
import { clog, parseBody } from "../lib/helper.js";
import { format, getBody } from "../lib/formatter.js";
import { pluginDir } from "./plugins.js";
import { getPlugins } from "./reload.js"
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { watch } from "chokidar";
import { config } from "../config/config.js"
import chalk from "chalk";

const line = chalk.green("=====================");
const pluginManagerFile = join(process.cwd(), "handler", "reload.js")
const watcher = watch(pluginDir, { ignored: /node_modules/ });
const plugins = await getPlugins()

/**
 *
 * @param {string} apa
 * @param {{[key: string]: any}} dbreff
 * @returns
 */


/**
 *
 * @param {User} m  - m dari baileys event map
 * @param {Sock} sock - sock dari mmakeWASocket
 * @returns {Promise<void>}
 */
async function handler(m, sock) {
  format(m);
  const body = getBody(m);
  const { prefix, cmd, args } = parseBody(body);
  const chatid = m.chatId;
  const userid = m.sender;
  
  const userinfo = userdb.pilih(userid);

  /**
   * 
   * @param {string} text 
   */
    m.reply = (text) => {
    sock.sendMessage(chatid, {
      text: text
    }, { quoted: m })
  }
  
  const status = m.isOwner
    ? "owner"
    : m.isSudo
      ? "sudo"
      : m.isPremium
        ? "premium"
        : m.key.fromMe
          ? "bot"
          : "user";

  //console.log("debug m: ", m);

  clog.messageReceipt(`
  ${line}
  userid: ${userid}
  from: ${chatid}
  content: ${body}
  status: ${status}
  ${line}
 `);
  
  if (plugins[cmd] && config.settings.mode === "public") {
    await plugins[cmd].run(m, sock);
  }
  console.log(plugins)
}


class WorkerManager {
  /** @type {Worker | null} */ #worker;
  #file;
  /**
   * 
   * @param {string} file
   */
  constructor(file) {
    this.#worker = null;
    this.#file = file
  }

  create() {
    if (this.#worker === null || this.#worker.threadId === -1) {
      this.#worker = new Worker(this.#file);
    }
    return this.#worker;
  }

  async terminate() {
    if (this.#worker) {
     await this.#worker.terminate();
      this.#worker = null;
    }
  }
  
}


//const worker = new WorkerManager(pluginManagerFile)
let worker = null;
watcher.on("change", async(filepath) => {
  console.log("file: " + filepath);
  worker = new Worker(pluginManagerFile);
  worker.postMessage({filepath});
})

if (worker) {
worker.on("message", async(message) => {
 await worker.terminate()
})
}

export default handler;