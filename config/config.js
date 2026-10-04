import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import "dotenv/config";

const config = /** @type {const} */ ({
  /**
   * @returns {{[key: string]: any}} config.json content - if failed, failed = true. if success, failed = undefined. you can test "failed" to check success/fail
   */
  get file() {
    try {
      const res = readFileSync(
        join(process.cwd(), "config", "config.json"),
        "utf8",
      );
      if (!res) throw new Error("Gagal membaca config.json");
      return JSON.parse(res);
    } catch (err) {
      const e = /** @type {Error} */ (err);
      console.log(chalk.red("[FILE CONFIG]: ") + e.message);
      return { failed: true };
    }
  },
  /** @param {Record<string, any>} obj */
  set file(obj) {
    if (typeof obj !== "object") return;
    writeFileSync(
      join(process.cwd(), "config", "config.json"),
      JSON.stringify(obj, null, 2),
      { encoding: "utf8" },
    );
  },
  bot: {
    name: "HuTao", // nama bot lu
    number: process.env.BOT_NUMBER || "62xxxxx", // nomor bot lu
    sessionFolder: "auth", // bebas
    autoDeleteSessionFolder: true, // auto delete session folder klo error
    pairingCode: "HUTAOOAI", // bebas custom yg penting 8 katakter
    commandsFolder: "commands", // ubah aja klo paham
    /** @returns {string[]} */
    get owners() {
      const res = config.file;
      return res.owners;
    },
    /** @returns {string[]} */
    get sudos() {
      const res = config.file;
      return res.sudos;
    },
    /** @returns {string[]} */
    get premiums() {
      const res = config.file;
      return res.premiums;
    },
    db: {
      dirname: join(process.cwd(), "lib", "database"),
      filename: "users",
    },
    debugMode: {
      pluginLoad: true, // kasih info plugin yang di load
      pluginError: true, // kasih info klo plugin error
      messageReceipt: true, //kasih tau klo ada pesan masuk
    },
  },
  owner: {
    name: process.env.OWNER_NAME || "mzkiyo", // nama lu
    number: process.env.OWNER_NUMBER || "62xxxxx", // nomor owner
  },
  settings: {
    /** @type {boolean} */
    get protectOwnerNumber() {
      const res = config.file;
      return res.protectOwnerNumber;
    },
    /** @param {boolean} status*/
    set protectOwnerNumber(status) {
      if (typeof status !== "boolean") return;
      const res = config.file;
      res.protectOwnerNumber = status;
      config.file = res;
    },
    /** @type {boolean} */
    get singleOwner() {
      const res = config.file;
      return res.protectOwnerNumber;
    },
    set singleOwner(status) {
      if (typeof status !== "boolean") return;
      const res = config.file;
      res.protectOwnerNumber = status;
      config.file = res;
    },
    /** @type {string[]} */
    get prefixes() {
      const res = config.file;
      return res.prefixes;
    },
    /** @param {string[]} inputs */
    set prefixes(inputs) {
      if (!Array.isArray(inputs)) return;
      const res = config.file;
      res.prefixes = inputs;
      config.file = res;
    },
    /** @type {string} */
    get prefix() {
      const res = config.file;
      return res.prefix;
    },
    /** @param {string} pref */
    set prefix(pref) {
      if (typeof pref !== "string") return;
      const res = config.file;
      res.prefix = pref;
      config.file = res;
    },
    /** @type {boolean} */
    get multiPrefix() {
      const res = config.file;
      return res.multiPrefix;
    },

    set multiPrefix(status) {
      if (typeof status !== "boolean") return;
      const res = config.file;
      res.multiPrefix = status;
      config.file = res;
    },
    /** @type{"private" | "public"} */
    get mode() {
      const res = config.file;
      return res.mode;
    },

    set mode(status) {
      if (status === "public" || status === "private") {
        const res = config.file;
        res.mode = status;
        config.file = res;
      }
    },
  },
  others: {
    placeholders: {
      senderIdPlaceholder: "unknown",
      senderPushNamePlaceholder: "unnamed",
      senderNumberPlaceholder: 0,
      messageTypePlaceholder: "unknown",
      messageBodyPlaceholder: "undetected",
      chatIdPlaceholder: "undetected",
    },
  },
});

export { config };
