import { config as cfg } from "./config/config.js"

export const apps = [
  {
    name: "hutao",
    script: "hutao.js",
    instances: "max",
    exec_mode: "cluster",
    max_memory_restart: "1G",
    silent: true,
    pmx: false,
    automation: false,
    watch: true,
    ignore_watch: ["node_modules", ".npm", cfg.bot.sessionFolder]
  }
  ]

