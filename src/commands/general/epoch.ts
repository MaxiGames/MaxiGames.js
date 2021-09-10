import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";

const epoch: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("epoch")
    .setDescription("How many seconds have elapsed since the epoch?"),
  async execute(interaction) {
    const embed = MGEmbed(s.MGInfo)
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

export default epoch;
