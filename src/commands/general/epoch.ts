import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import MyCommand from "../../types/command";

const whoami: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("epoch")
    .setDescription("How many seconds have elapsed since the epoch?"),
  async execute(interaction) {
    const embed = new MessageEmbed()
      .setColor("#57F287")
      .setTitle(`Time elapsed since the epoch:D`)
      .setDescription(
        "Find out more on what an epoch is here: https://searchdatacenter.techtarget.com/definition/epoch :D"
      )
      .addFields({
        name: "Time since epoch:",
        value: `${Math.round(Date.now() / 1000)} seconds!`,
      });

    await interaction.reply({ embeds: [embed] });
  },
};

export default whoami;
