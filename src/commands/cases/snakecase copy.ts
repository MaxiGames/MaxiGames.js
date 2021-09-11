import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let pascalCasedFunc = function (string: string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w+)/, "g"),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, "g"), "")
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
};

const pascalCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("pascalcase")
    .setDescription("Convert some text into pascalcase")
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
      .setTitle("Succesfully pascalcased!")
      .setDescription(`PascalCase Result: ${pascalCasedFunc(str)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default pascalCase;
