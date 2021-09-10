import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";
import * as admin from "firebase-admin";

const current: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance? Do you have money to spare? :D")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("U can use this option to check another users' balance")
        .setRequired(false)
    ),

  async execute(interaction) {
    const embed = MGEmbed(s.MGInfo)
      .setTitle("Balance!")
      .setDescription("'s balance")
      .addFields();
    await interaction.reply({ embeds: [embed] });
  },
};

export default current;
