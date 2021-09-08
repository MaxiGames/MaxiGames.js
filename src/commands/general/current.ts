export {};

const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Get the current date and time"),
  async execute(interaction) {
    const now = new Date();
    const embed = new MessageEmbed()
      .setColor("teal")
      .setTitle("Current Date and Time")
      .setDescription("Find the current date and time below :D")
      .addFields(
        { name: "Date", value: now.toDateString(), inline: true }
        // { name: 'Day', value: now.to}
      );
    await interaction.reply({ embeds: [embed] });
  },
};
