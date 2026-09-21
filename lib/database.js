"use strict";

// Coded by Salman
// buat atur database

/**
 * program database yang konsisten antara input dan output
 */

import { join } from "node:path";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";

import { config } from "../config/config.js";
const dbdirname = config?.bot?.db?.dirname;
const dbfilename = config?.bot?.db?.filename;
const print = console.log;
const printe = console.error;

//const folder = join(process.cwd(), "database");
//const file = join(process.cwd(), "database", "users.json");

/**
 * @typedef {object} TanamUpdate
 * @property {string} autoai -> status autoai on/off
 * @property {string} [key] -> properti lain, harus berupa string
 */

/**
 *
 * class pengatur database user yang konsisten dan customable.
 * - Mengutamakan hasil pasti daripada kecepatan.
 * - Mengutamakan input dan output yang konsisten
 * - untuk proyek bot, class ini cukup memadai karena konsistensinya
 * - Tidak asbun dan jelas antara input-output
 * - sekian dan terimakasih
 */
class User {
  #file;
  #dir;
  #path;

  /**
   *
   * @param {string} dir - path buat folder
   * @param {string} filename - name for database file.
   */
  constructor(dir, filename) {
    this.#dir = dir;
    this.#file = this.#sureFilename(filename);
    this.#path = join(this.#dir, this.#file);
    this.siapinLahan();
  }

  /**
   *
   * @param {string} file
   * @returns {string} - fix filename (string)
   */

  #sureFilename(file) {
    return file.endsWith(".json") ? file : file + ".json";
  }

  siapinLahan = () => {
    print("[DATABASE LOG]: Inisiasi database user...");

    if (!existsSync(this.#dir)) {
      print(
        "[DATABASE LOG]: Folder database tidak ditemukan. otomatis mmebuat...",
      );
      mkdirSync(this.#dir);
    }
    if (!existsSync(this.#path) || readFileSync(this.#path, "utf8") === "") {
      print(
        "[DATABASE LOG]: File database " +
          this.#path +
          " tidak ditemukan. Otomatis membuat file...",
      );
      writeFileSync(this.#path, "{}");
    }
  };

  /**
   * panen -> mengambil data seluruh user
   * @returns {object} users -> list semua user beserta metadata
   */
  panen = () => {
    const data = readFileSync(this.#path, "utf8");
    return JSON.parse(data);
  };

  /**
   *
   * @param {string} id -> id user (format: 62xxxxx@s.whatsapp.net)
   * @returns {object} userinfo -> metadata mengenai user dengan id tersebut
   */
  pilih(id) {
    try {
      /** @type Record<string, any>*/
      const list = this.panen();

      const userinfo = list[id];

      if (!userinfo) {
        print(
          "[DATABASE LOG]: User dengan id " +
            id +
            " tidak ditemukan di database",
        );
        return { failed: true };
      }

      return userinfo;
    } catch (err) {
      const e = /** @type {Error} */ (err);
      printe("[DATABASE LOG]: Error di method pilih >> " + e.message);
      return { failed: true };
    }
  }

  /**
   * 
   * @param {UserTanamParams}
   * @example
   * ```js
   * tanam({
   *    id :"621234567890@s.whatsapp.net",
   *    update: [{
   *      autoai: "on",
   *      status: "user",
   *      blocked: "false",
          //tambahin aja terserah yg penting string
   *    }]
   * })
   * ````
   */

  tanam({ id, update }) {
    /** @type {{[key: string]: any}} */
    let hasil = {};
    try {
      if (!id) throw new Error("User.tanam() error: parameter id belum diisi");
      if (!update)
        throw new Error("User.tanam() error: parameter update belum diisi");

      /** @type {{[key: string]: any}} */
      const userdata = this.panen();

      for (let key in update) {
        if (update[key] === undefined || update[key] === null) continue;
        hasil[key] = update[key];
      }

      userdata[id] = hasil;

      writeFileSync(this.#path, JSON.stringify(userdata, null, 2), "utf8");
    } catch (err) {
      const e = /** @type {Error} */ (err);
      printe("[DATABASE LOG]: Error di method tanam >> " + e.message);
    }
  }

  /**
   *
   * @param {string} id
   * @returns {boolean} hasil
   */
  has(id) {
    const userdata = this.pilih(id);
    let hasil = userdata ? true : false;
    return hasil;
  }

  reset() {
    const userdata = this.panen();
    const bakPath = this.#path + ".bak";
    writeFileSync(bakPath, JSON.stringify(userdata, null, 2), "utf8");
    writeFileSync(this.#path, "{}", "utf8");
    print(
      "[DATABASE LOG]: Database user berhasil direset. Backup tersimpan di " +
        bakPath,
    );
  }

  restore() {
    const bakPath = this.#path + ".bak";
    if (!existsSync(bakPath)) {
      print(
        "[DATABASE LOG]: File backup database tidak ditemukan. Tidak ada yang di-restore.",
      );
      return;
    }
    const bakData = readFileSync(bakPath, "utf8");
    writeFileSync(this.#path, bakData, "utf8");
    print("[DATABASE LOG]: Database user berhasil di-restore dari backup.");
  }

  /* === TAMBAHAN === */

  /**
   *
   * @param {string} id - id unik user
   * @returns {boolean} - is user a owner?
   */
  isOwner(id) {
    /** @type {{[key: string]: any}} */
    const obj = this.pilih(id);
    return obj["isOwner"] ? true : false;
  }

  /**
   *
   * @param {string} id - id unik user
   * @returns {boolean} - is user a sudo?
   */
  isSudo(id) {
    /** @type {{[key: string]: any}} */
    const obj = this.pilih(id);
    return obj["isSudo"] ? true : false;
  }

  /**
   *
   * @param {string} id - id unik user
   * @returns {boolean} is user a premium?
   */
  isPremium(id) {
    /** @type {{[key: string]: any}} */
    const obj = this.pilih(id);
    return obj["isPremium"] ? true : false;
  }
}

const userdb = new User(dbdirname, dbfilename);

export { userdb };
