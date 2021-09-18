import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../../lib/flavoured";
import MGCommand from "../../../types/command";

const invite: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite MaxiGames to your server :D"),
  async execute(interaction) {
    const embed = MGEmbed()
      .setTitle("Invite Maxigames :D")
      .setDescription(
        "[Click here!](https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=399397481590&scope=bot%20applications.commands)"
      )
      .setColor("#57F287");
    await interaction.reply({ embeds: [embed] });
  },
};
export default invite;
