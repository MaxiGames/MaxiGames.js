export {};
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hallo")
    .setDescription("Say hallo to Maxegmaes!"),
  async execute(interaction) {
    await interaction.reply("Hallo!");
  },
};
