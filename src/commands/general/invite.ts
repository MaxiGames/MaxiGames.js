import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";

const invite: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite maxigames to your server :D"),
  async execute(interaction) {
    const embed = MGEmbed(s.MGInfo)
      .setTitle("Invite Maxigames :D")
      .setDescription(
        "[Click here!](https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=399397481590&scope=bot%20applications.commands)"
      )
      .setColor("#57F287");
    await interaction.reply({ embeds: [embed] });
  },
};

export default invite;
