


import chalk from "chalk";

const line = chalk.green("=====================");

/**
 * 
 * @param {M} m 
 * @param {Sock} sock 
 */
async function handler (m, sock) {
  
  console.log(`
  ${line}
  sender: ${m.sender}
  from: ${m.key.remoteJid}
  content: ${m.message}
  ${line}
 `)
}


export default handler;