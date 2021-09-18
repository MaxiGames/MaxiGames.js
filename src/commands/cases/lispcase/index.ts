/*
 * File: src/commands/cases/lispcase.ts
 * Description: Handles convert to lispcase command
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../../types/command";
import { MGEmbed } from "../../../lib/flavoured";
import MGStatus from "../../../lib/statuses";

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
    const toConvert = interaction.options.getString("string");

    if (toConvert === null) return; // no null string >:(

    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully lispcased!")
      .setDescription(`lisp-case Result: ${lispCaseFunc(toConvert)}`);

    await interaction.reply({ embeds: [embed] }); // reply with embed defined above
  },
};

export default lispCase;
