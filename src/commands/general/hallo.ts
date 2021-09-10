import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../types/command";

const hallo: MGCommand = {
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
    if (love > 1800) {
      await interaction.reply({
        content: "Ono we only have 1800 love to give ;-;",
        ephemeral: true,
      });
    } else if (love < 1) {
      await interaction.reply({
        content: "No hate! >:(",
        ephemeral: true,
      });
    } else {
      await interaction.reply(`Hall${"o".repeat(love)} ${name}!!!`);
    }
  },
};

export default hallo;
