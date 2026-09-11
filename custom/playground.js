import { readFileSync } from "fs";
import { join } from "path";

const res = readFileSync(join("playground.json"), "utf8");

console.log(typeof res)