import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let lowerCaseFunc = require("lodash/lowerCase") as (param: string) => string;

const lowercase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lowercase")
    .setDescription("Convert some text into lowercase")
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
      .setTitle("Succesfully lowercased!")
      .setDescription(`lowercased Result: ${lowerCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default lowercase;
