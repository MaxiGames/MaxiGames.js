/*
* File: src/commands/cases/camelcase.ts
* Description: Handles command for converting text to camelcase
*/



import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let camelCaseFunc = require("lodash/camelCase") as (param: string) => string;




const camelCase: MyCommand = {  
  // exports (self explanatory)
  data: new SlashCommandBuilder()
    .setName("camelcase") 
    .setDescription("Convert some text into camelcase")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("Text that you want to change")
        .setRequired(true)
    ),

  
  // execute command
  async execute(interaction) {
    const toConvert = interaction.options.getString("string"); // argument of text to convert
    if (toConvert === null) return; // oi why u give me null
    
    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully camelCased!")
      .setDescription(`camelCased Result: ${camelCaseFunc(str)}`);

    await interaction.reply({ embeds: [embed] }); // reply with the embed defined above! :D
  },
};


export default camelCase;
