import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

const WAProtoFile = join(
  cwd(),
  "node_modules",
  "@whiskeysockets",
  "baileys",
  "WAProto",
  "index.d.ts",
);

async function get() {
  const res = await fetch(
    "https://raw.githubusercontent.com/WhiskeySockets/Baileys/refs/heads/master/WAProto/index.d.ts",
  );
  if (!res.ok) {
    console.log(await res.json());
    throw new Error("gagal");
  }
  return await res.text();
}

async function write() {
  try {
    console.log("fetching...");
    const string = await get();
    console.log("writing...");
    writeFile(WAProtoFile, string, "utf8");
  } catch (err) {
    const e = /** @type {Error} */ (err);
    console.error("Error while writing event-types: ", e.message);
  }
}

await write()

export { write };
