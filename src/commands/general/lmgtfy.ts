import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

// TODO: mention the person who couldn't be bothered to STFW?

const lmgtfy: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lmgtfy")
    .setDescription("For people who don't know how to STFW")
    .addStringOption((option) =>
      option
        .setName("searchstring")
        .setDescription("what to search for")
        .setRequired(true)
    ),
  async execute(interaction) {
    let searchstr: string = interaction.options.getString("searchstring")!;
    if (searchstr.length > 128) {
      await interaction.reply({
        content: "Search string too long; must be less than 128 chars.",
        ephemeral: true,
      });
      return;
    }

    searchstr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    await interaction.reply(`https://lmgtfy.app/?q=${searchstr}&iie=1`); // TODO: exploitable maybe???
  },
};

export default lmgtfy;
