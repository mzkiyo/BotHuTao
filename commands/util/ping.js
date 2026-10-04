const command = {
  name: "ping",
  alias: ["bot"],
  /**
   * 
   * @param {User} m 
   * 
   */
  run: async(m) => {
    m.reply("bot aktif!")
  }
}

export { command }

