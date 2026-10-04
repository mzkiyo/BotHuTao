import { config as cfg } from "../config/config.js";

/**
 * @typedef {typeof cfg} cfg
 * @typedef {typeof cfg.bot.debugMode} debug
 * @typedef {keyof typeof cfg.bot.debugMode} debugKey
 */

/** @type {debug} */
const debug = cfg.bot.debugMode;

const clog = /** @type {Record <debugKey, (text: string) => void>} */ ({});

for (let rawkey in debug) {
  const key = /** @type {debugKey} */ (rawkey);
  /**
   * @param {string} text - text yg mau di log
   * @returns {void}
   */
  function log(text) {
    if (debug[key]) {
      process.stdout.write(text + "\n", "utf8");
    }
  }

  clog[key] = log;
}

/**
 * parsing text to prefix, cmd, and args
 * @param {string} body pesan/text dari user
 * @returns {{prefix: string, cmd: string, args: string[]}} result - {prefix, cmd, args}
 * @example
 * parseBody("!start my bot") // {prefix: "!", cmd: "start", args: ["my", "bot"]}
 * @example
 * parseBody("start my bot") // {prefix: "", cmd: "start", args: ["my", "bot"]}
 */
function parseBody(body) {
  try {
    const firstEntry = body.trim().slice(0, 1) || "";
    let prefix = "";
    let cutter = 0;
    if (
      cfg.settings.multiPrefix &&
      !cfg.settings.prefixes.includes(firstEntry)
    ) {
      prefix = "";
      cutter = 0;
    } else if (
      cfg.settings.multiPrefix &&
      cfg.settings.prefixes.includes(firstEntry)
    ) {
      cutter = 1
      prefix = firstEntry;
    } else if (
      !cfg.settings.multiPrefix &&
      firstEntry !== cfg.settings.prefix
    ) {
      cutter = 0;
      prefix = "";
    } else if (
      !cfg.settings.multiPrefix &&
      firstEntry === cfg.settings.prefix
    ) {
      cutter = 1;
      prefix = firstEntry;
    } else {
      cutter = 1;
      prefix = firstEntry
    }
    const [cmd, ...args] = body.trim().slice(cutter).trim().split(/\s+/) || "";
    const result = {
      firstEntry,
      prefix,
      cmd,
      args,
    };
    return result;
  } catch (err) {
    const e = /** @type {Error} */ (err);
    console.error("Error Saat Parsing Teks: " + e.message);
    const result = {
      firstEntry: "",
      prefix: "",
      cmd: "",
      args: [],
    };
    return result;
  }
}

export { clog, parseBody };
