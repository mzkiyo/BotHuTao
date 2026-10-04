import { config as cfg } from "../config/config.js";

const {
  senderIdPlaceholder: idPlaceholder,
  messageTypePlaceholder: messageType,
  messageBodyPlaceholder: messageBody,
  chatIdPlaceholder: chatId
} = cfg.others.placeholders;

/**
 * Formatting messages[0]
 * @param {User} m
 * @returns {void}
 */
function format(m) {
  const jid = m.key.remoteJid;
  //m.chatId = jid ||chatId;
  m.isGroup = jid?.endsWith("@g.us") || false;
  m.isNewsletter = jid?.endsWith("@newsletter") || false;
  
  if (m.isGroup) {
    m.chatId = m.key.remoteJid || chatId
    m.sender = m?.key?.participantAlt || idPlaceholder;
  } else if (m.isNewsletter) {
    m.sender = m?.key?.remoteJid || idPlaceholder;
  } else  if (m.key.fromMe) {
    m.chatId = m.key.remoteJid || chatId
    m.sender = `${cfg.bot.number}@swhatsapp.net`
  } else {
    m.chatId = m.key.remoteJidAlt || chatId;
    m.sender = m.key.remoteJidAlt || idPlaceholder;
  }

  m.senderNumber = m.sender.split("@")[0].trim();

  m.isOwner = cfg.settings.singleOwner && m.senderNumber == cfg.owner.number.trim() ? true : !cfg.settings.singleOwner && cfg.bot.owners.includes(m.senderNumber) || !cfg.settings.singleOwner && cfg.owner.number.trim() === m.senderNumber ? true : false;

  m.isPremium = cfg.bot.premiums.includes(m.senderNumber);
  m.isSudo = cfg.bot.sudos.includes(m.senderNumber);
  
  m.type = m.message?.conversation
    ? "text"
    : m.message?.extendedTextMessage
      ? "quoted"
      : m.message?.imageMessage
        ? "image"
        : m.message?.videoMessage
          ? "video"
          : m.message?.contactMessage
            ? "contact"
            : m.message?.contactsArrayMessage
              ? "contactArray"
              : m.message?.locationMessage
                ? "location"
                : m.message?.liveLocationMessage
                  ? "liveLocation"
                  : messageType;


}

/**
 * 
 * @param {M} m
 * @returns {string} body - teks yg bisa dibaca bot
 */
function getBody(m) {
    // search text/caption with short if/else
  const msg = m?.message;
  
  const newId = msg?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ? JSON.parse(msg?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson).id : null;
  
  const body = msg?.conversation || msg?.imageMessage?.caption || msg?.videoMessage?.caption || msg?.extendedTextMessage?.text || msg?.documentMessage?.caption || newId || messageBody;

  return body
}

export { format, getBody };
