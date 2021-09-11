import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let snakeCaseFunc = require("lodash/snakeCase") as (param: string) => string;

const snakeCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("snakecase")
    .setDescription("Convert some text into snakecase")
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
      .setTitle("Succesfully snakedcased!")
      .setDescription(`sanke_cased Result: ${snakeCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default snakeCase;
