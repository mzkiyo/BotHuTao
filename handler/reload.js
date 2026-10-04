import { parentPort } from "node:worker_threads";
import { plugins } from "./plugins.js";
if (parentPort) {
parentPort.on("message", async({ filepath }) => {
  console.log("load: ", filepath)
  let data;
  if (filepath.endsWith(".js")) {b
    const { command } = await import(`file://${filepath}?sawit=${Date.now()}`);
    data = command
  } else if (filepath.endsWith(".cjs")) {
    const command = await import(`file://${filepath}?sawit=${Date.now()}`);
    data = command.default
  }

  plugins[data.name] = data;

  console.log("reloaded: ", plugins[data.name])
})
}

const getPlugins = async() => plugins;
export { getPlugins }; 