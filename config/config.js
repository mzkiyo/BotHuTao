import { readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";

const config = {
  get read() {
    try {
      const res = readFileSync(join(process.cwd(), "config", "config.json"), "utf8");
      if (!res) throw new Error("Gagal membaca config.json");
      return JSON.parse(res)
    } catch (e) {
      console.log(chalk.red("[READ CONFIG]: ") + e.message)
    }
  },
  bot: {
    name: "HuTao",
    number: "62xxxxx",
    sessionFolder: "auth",
    pairingCode: "HUTAOOAI",
    
  },
  owner: {
    name: "mzkiyo",
    number: "62xxxxx"
  },
  settings: {
    get protectOwnerNumber() {
      const res = config.read;
      return res.protectOwnerNumber
    },
    get autoDeleteSessionFolder() {
      const res = config.read;
      return res.autoDeleteSessionFolder;
    }
  }
};

export { config };
