import { makeWASocket, WASocket, proto, BaileysEventMap } from "@whiskeysockets/baileys";

// Define tipe custom pesan yang udah di-serialize (kalo ada)
type CustomSerialize = {
  chat?: string;
  sender?: string;
  body?: string;
  isGroup?: boolean;
  reply?: (text: string, options?: any) => Promise<any>;
};

type mBaileys = BaileysEventMap["messages.upsert"]["messages"][number];

declare global {
  type M = mBaileys;
  type Sock = ReturnType<typeof makeWASocket>;
  type WASocketInstance = WASocket;
  type WAMessage = proto.IWebMessageInfo & CustomSerialize;
}

// custom types
declare global {
  // == lib/database.js ==

  type UserTanamParams = {
    /** identifier unik tiap user */
    id: string;
    /** data terkait user yang ingin di update */
    update: { [key: string]: any };
  };
}
