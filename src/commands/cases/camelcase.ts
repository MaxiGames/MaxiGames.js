import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";

const camelCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("camelcase")
    .setDescription("Convert some text into camelcase")
    .addStringOption((option) =>
      option.setName("string").setDescription("operand").setRequired(true)
    ),

  async execute(interaction) {
    const str = interaction.options.getString("string");
    // @ts-nocheck
    // prettier-ignore
    const cc = (o=>(o=>o(o))(o=>s=>s.length<=1?s:s[0]==" "?s.trim()[0].toUpperCase()+o(o)((o=>(o.length>1?o.slice(1-o.length):""))(s.trim())):s[0]+o(o)(s.slice(1-s.length)))(o.trim()))(str);
    const embed = MGEmbed(s.MGInfo).setTitle("CamelCased!").setDescription(cc);
    await interaction.reply({ embeds: [embed] });
  },
};

export default camelCase;
