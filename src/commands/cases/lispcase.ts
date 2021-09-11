import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let lispCaseFunc = require("lodash/kebabCase") as (param: string) => string;

const lispCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lispcase")
    .setDescription("Convert some text into lispcase")
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
      .setTitle("Succesfully lispcased!")
      .setDescription(`lisp-case Result: ${lispCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default lispCase;
