import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let camelCaseFunc = require("lodash/camelCase") as (param: string) => string;

const camelCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("camelcase")
    .setDescription("Convert some text into camelcase")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("Text that you want to change")
        .setRequired(true)
    ),

  async execute(interaction) {
    const str = interaction.options.getString("string");
    if (str === null) return;
    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully camelCased!")
      .setDescription(`camelCased Result: ${camelCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default camelCase;