import { makeWASocket, WASocket, proto, BaileysEventMap } from '@whiskeysockets/baileys';

// Define tipe custom pesan yang udah di-serialize (kalo ada)
type CustomSerialize = {
  chat?: string;
  sender?: string;
  body?: string;
  isGroup?: boolean;
  reply?: (text: string, options?: any) => Promise<any>;
};

type mBaileys = BaileysEventMap["messages.upsert"]["messages"][number];

// Injection variabel ke scope GLOBAL Node.js/Project
declare global {
  type M = mBaileys;
  type Sock = ReturnType<typeof makeWASocket>;
  type WASocketInstance = WASocket;
  type WAMessage = proto.IWebMessageInfo & CustomSerialize;
}
