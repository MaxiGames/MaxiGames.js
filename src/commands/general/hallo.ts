import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

const hallo: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("hallo")
    .setDescription("Say hallo to someone :D")
    .addIntegerOption((option) =>
      option
        .setName("length")
        .setDescription("Length of the hallo message")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the person you want to say hallo to!")
        .setRequired(false)
    ),
  async execute(interaction) {
    let length: number = interaction.options.getInteger("length") || 8;
    let name: string =
      interaction.options.getString("name") || interaction.user.username;
    length += name.length;
    if (length < 5 || length >= 2000) {
      await interaction.reply({
        content: "Invalid length!!! Length must be between 5 and 2000",
        ephemeral: true,
      });
      return;
    }
    length -= 7 + name.length;
    const numberOfO = "o".repeat(length);
    await interaction.reply(`Hall${numberOfO} ${name}!!!`);
  },
};

export default hallo;
