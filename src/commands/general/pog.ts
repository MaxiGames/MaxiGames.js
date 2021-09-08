const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pog")
    .setDescription("Replies with Pog!"),
  async execute(interaction) {
    await interaction.reply("Pog!");
  },
};
