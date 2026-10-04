import { spawn } from "node:child_process";

spawn("node_modules/.bin/pm2-runtime", ["start", "ecosystem.config.js"], {
  stdio: "inherit"
})
