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

type config = {
  protectOwnerNumber: boolean;
}

// from packages
declare global {
  type M = mBaileys;
  type Sock = ReturnType<typeof makeWASocket>;
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

  // == lib/ai-engine.js ==
  type AIReturns = {
    /** hasil respon AI */
    hasil: string;
    /** proses berfikir AI (klo ada) */
    thinking: string
  }
  type AIParams = {
    /** set character AI */ 
    system: string;
    /** message untuk dijawab AI */
    message: string
  }

  // == handler/index.js ==
  type MyPlugin = {
    name: string;
    alias: string[];
    description: string;
    run: () => Promise<void>;
  }

  // == lib/formatter.js ==
  type User = M  & {
    reply: (text: string) => void;
    sender: string;
    senderNumber: string | number;
    chatId: string;
    isGroup: boolean;
    type: "text" | "quoted" | "image" | "video" | "audio" | "contact" | "contactArray" | "location" | "liveLocation" | "unknown";
    isOwner: boolean;
    isSudo: boolean;
    isPremium: boolean;
    isGroup: boolean;
    isNewsletter: boolean;
  }
}
