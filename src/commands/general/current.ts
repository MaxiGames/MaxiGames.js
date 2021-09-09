import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import type MyCommand from "../../types/command";

const current: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Get the current date and time"),

  async execute(interaction) {
    const now = new Date();
    const embed = new MessageEmbed()
      .setColor("#009090")
      .setTitle("Current Date and Time")
      .setDescription("Find the current date and time below :D")
      .addFields(
        { name: "Date", value: now.toDateString(), inline: true }
        // { name: 'Day', value: now.to}
      );
    await interaction.reply({ embeds: [embed] });
  },
};

export default current;
