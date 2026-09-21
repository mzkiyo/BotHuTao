import { readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";

const config = {
  /**
  * @returns {{[key: string]: any}} - if failed, failed = true. if success, failed = undefined. you can test "failed" to check success/fail
  */
  get read() {
    try {
      const res = readFileSync(join(process.cwd(), "config", "config.json"), "utf8");
      if (!res) throw new Error("Gagal membaca config.json");
      return JSON.parse(res)
    } catch (err) {
      const e = /** @type {Error} */ (err);
      console.log(chalk.red("[READ CONFIG]: ") + e.message);
      return { failed: true };
    }
  },
  bot: {
    name: "HuTao",
    number: "62xxxxx",
    sessionFolder: "auth",
    pairingCode: "HUTAOOAI",
    /** @returns {string[]} */
    get owners() {
      const res = config.read;
      return res.owners;
    },
    get sudos() {
      const res = config.read;
      return res.sudos;
    },
    get premiums() {
      const res = config.read;
      return res.premiums;
    },
    db: {
      dirname: join(process.cwd(), "lib", "database"),
      filename: "users"
    }
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
