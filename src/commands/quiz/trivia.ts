import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../types/command";
import { ColorResolvable, MessageEmbed } from "discord.js";

const trivia: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Trivia Questions!")
    .addIntegerOption((option) =>
      option
        .addChoice("easy", 1)
        .addChoice("medium", 2)
        .addChoice("hard", 3)
        .setName("difficulty")
        .setDescription(
          "Choose ur difficulty level, the more difficult, the more points!"
        )
    ),
  async execute(interaction) {},
};

export default trivia;
