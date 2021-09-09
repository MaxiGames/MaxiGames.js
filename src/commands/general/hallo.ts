import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

const hallo: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("hallo")
    .setDescription("Say hallo to someone :D")
    .addIntegerOption((option) =>
      option
        .setName("love")
        .setDescription("How much hallo can you give? :D")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the person you want to say hallo to!")
        .setRequired(false)
    ),
  async execute(interaction) {
    const love: number = interaction.options.getInteger("love") || 1;
    const name: string =
      interaction.options.getString("name") || interaction.user.username;
    if (love < 1 || love >= 1800) {
      await interaction.reply({
        content: "Invalid length!!! Length must be between 1 and 1800",
        ephemeral: true,
      });
      return;
    }
    await interaction.reply(`Hall${"o".repeat(love)} ${name}!!!`);
  },
};

export default hallo;
