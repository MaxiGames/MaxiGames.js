import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../../types/command";

const pog: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("pog")
    .setDescription("Replies with Pog!"),
  async execute(interaction) {
    await interaction.reply("Pog!");
  },
};

export default pog;
