import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const epoch: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("epoch")
    .setDescription("How many seconds have elapsed since the epoch?"),
  async execute(interaction) {
    const embed = MGEmbed(MGStatus.Info)
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
