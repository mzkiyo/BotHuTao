import { userdb } from "./lib/database.js";


import chalk from "chalk";

const line = chalk.green("=====================");

/**
 * 
 * @param {string} apa 
 * @param {{[key: string]: any}} dbreff 
 * @returns 
 */
const is = (apa, dbreff) => dbreff[apa] ? true : false;

/**
 * 
 * @param {M} m  - m dari baileys event map
 * @param {Sock} sock - sock dari mmakeWASocket
 */
async function handler (m, sock) {

  const chatid = m.key.remoteJid;
  const userid = /** @type {string} */ (m.key.participant?.toString());
  const userinfo = userdb.pilih(userid);

  const isOwner = is("isOwner", userinfo);
  const isSudo = is("isSudo", userinfo);
  const isPremium = is("isPremium", userinfo);
  
  console.log(`
  ${line}
  userid: ${userid}
  from: ${chatid}
  content: ${m.message}
  ${line}
 `)
}


export default handler;