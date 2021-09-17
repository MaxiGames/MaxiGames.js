/*
* File: src/commands/cases/lowercase.ts
* Description: Handles command to convert text to lowercase
*/

import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let lowerCaseFunc = require("lodash/lowerCase") as (param: string) => string;




// Export data
const lowercase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lowercase")
    .setDescription("Convert some text into lowercase")
    .addStringOption((option) => option
        .setName("string")
        .setDescription("Text that you want to change")
        .setRequired(true)
    ),

  // execution data
  async execute(interaction) {
    const toConvert = interaction.options.getString("string");
    
    if (toConvert === null) return; // >:(
    
    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully lowercased!")
      .setDescription(`lowercased Result: ${lowerCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default lowercase;
