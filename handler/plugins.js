// plugin loader

import { join } from "node:path";
import { readdirSync } from "node:fs";
import { parentPort } from "node:worker_threads"
import { clog } from "../lib/helper.js";

/** @type {{[key: string]: MyPlugin}} */
const plugins = {};
const pluginDir = join(process.cwd(), "commands");

let i = 0;

/**
 * 
 * @param {string} dirname - nama folder yang berisi plugin 
 */
async function load(dirname) {
  const entries = readdirSync(dirname, {encoding: "utf8",withFileTypes: true});
  
  for (let entry of entries) {
      const filepath = join(dirname, entry.name)
    if (entry.isDirectory()) {
      load(filepath);
      continue;
    } else if (entry.name.endsWith(".js")) {
      i++;
      const { command } = await import(filepath);
      plugins[command.name] = command
      clog.pluginLoad(`Loaded ESM command: "${command.name}". from: ${filepath}`);
    } else if (entry.name.endsWith(".cjs")) {
      i++;
      const data = await import(join(dirname, entry.name));
      const defData = data.default;
      plugins[defData.name] = defData
      clog.pluginLoad(`Loaded CJS command: "${defData.name}". from: ${join(dirname, entry.name)}`)
    } else {
      clog.pluginLoad(`Found another file: ${entry.name}`);
    }
  }
  clog.pluginLoad(`Plugin Loaded: ${i}`);
  i = 0;
}

await load(pluginDir);

if (parentPort) {
parentPort.on("message", async({filepath}) => {
  console.log("disuruh jir")
  if (filepath) {
    /** @type {MyPlugin} */
    const obj = await import(`file://${filepath}?sawit=${Date.now()}`);
    plugins[obj.name] = obj;
  }
})
}


export { load, pluginDir, plugins }
